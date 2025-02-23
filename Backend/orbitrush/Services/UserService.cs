using orbitrush.Database.Entities;
using orbitrush.Database.Repositories;
using orbitrush.Dtos;
using orbitrush.Mappers;
using orbitrush.Utils;

namespace orbitrush.Services;

public class UserService
{
    private UnitOfWork _unitOfWork;
    private SmartSearchService smartSearchService;
    private UserMapper _userMapper;

    public UserService(UnitOfWork unitOfWork, UserMapper userMapper)
    {
        _unitOfWork = unitOfWork;
        _userMapper = userMapper;
        smartSearchService = new SmartSearchService();
    }

    public async Task<string> GetNameById(int id)
    {
        return await _unitOfWork.UserRepository.GetNameByIdAsync(id);
    }

    public async Task<List<UserDto>> GetFriendList(int id)
    {
        return await _unitOfWork.UserRepository.GetFriendList(id);
    }

    public async Task<string> GetUsedImageAsync(IFormFile image, string defaultImage, string name)
    {
        if (image == null)
        {
            return defaultImage;
        }

        string fileExtension = Path.GetExtension(image.FileName).ToLower();
        string fileName = name.ToLower() + "_" + Guid.NewGuid().ToString() + fileExtension;
        string filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "profiles", fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await image.CopyToAsync(stream);
        }

        return "images/profiles/" + fileName;
    }

    public async Task<List<UserDto>> GetUsersExcludingFriends(int userId)
    {
        return await _unitOfWork.UserRepository.GetUsersExcludingFriends(userId);
    }

    public async Task<List<UserDto>> SearchUsers(int userId, string search, bool includeFriends)
    {
        if (string.IsNullOrWhiteSpace(search))
        {
            throw new ArgumentException("La búsqueda no puede estar vacía.");
        }

        List<string> names = includeFriends
            ? await _unitOfWork.UserRepository.GetFriendByNames(userId)
            : await _unitOfWork.UserRepository.GetUserByNames(userId);

        IEnumerable<string> matchedNames = smartSearchService.Search(search, names);

        List<User> matchedUsers = new List<User>();

        if (matchedNames != null && matchedNames.Any())
        {
            if (!includeFriends)
            {
                matchedUsers = await _unitOfWork.UserRepository.GetUsersByMatchedNames(matchedNames);
            }
            else
            {
                matchedUsers = await _unitOfWork.UserRepository.GetFriendsByMatchedNames(userId, matchedNames);

            }
        }

        return _userMapper.UserToDtoList(matchedUsers);
    }

    public async Task<UserDto> GetUserWithMatches(int userId)
    {
        var user = await _unitOfWork.UserRepository.GetUserWithMatchesAsync(userId);
        if (user == null)
            return null;

        return _userMapper.UserMatchesDto(user);
    }

    public async Task<UserProfileDto> GetUserProfile(int id)
    {
        var user = await _unitOfWork.UserRepository.GetUserWithMatchesAsync(id);
        if (user == null)
            return null;

        return UserMapper.UserToProfileDto(user);
    }

    public async Task UpdateUserProfileInDatabase(int userId, UpdateUserDto userDto)
    {
        if (userDto == null)
            throw new ArgumentNullException(nameof(userDto), "El objeto UserDto no puede ser nulo.");

        User existingUser = await _unitOfWork.UserRepository.GetByIdAsync(userId)
            ?? throw new KeyNotFoundException("Usuario no encontrado.");

        await ValidateAndUpdateUser(existingUser, userDto, userId);

        if (userDto.Image != null)
        {
            if (existingUser.Image == null || existingUser.Image != userDto.Image.FileName)
            {

                DeleteOldImage(existingUser.Image);

                string newImagePath = await GetUsedImageAsync(userDto.Image, existingUser.Image ?? "images/profiles/default.jpg", existingUser.Name);
                existingUser.Image = newImagePath;
            }
        }

        await _unitOfWork.SaveAsync();
    }


    private async Task ValidateAndUpdateUser(User existingUser, UpdateUserDto userDto, int userId)
    {
        if (!string.IsNullOrEmpty(userDto.Name) && userDto.Name != existingUser.Name)
        {
            bool nameExists = await _unitOfWork.UserRepository.ExistName(userDto.Name, userId);
            if (nameExists)
            {
                throw new InvalidOperationException("El nombre de usuario ya está en uso.");
            }
            existingUser.Name = userDto.Name;
        }

        if (!string.IsNullOrEmpty(userDto.Email) && userDto.Email != existingUser.Email)
        {
            bool emailExists = await _unitOfWork.UserRepository.ExistEmail(userDto.Email, userId);
            if (emailExists)
            {
                throw new InvalidOperationException("El correo electrónico ya está en uso.");
            }
            existingUser.Email = userDto.Email;
        }

        if (!string.IsNullOrEmpty(userDto.Password))
        {
            existingUser.HashPassword = PasswordHelper.Hash(userDto.Password);
        }
    }

    private void DeleteOldImage(string oldImagePath)
    {
        if (!string.IsNullOrEmpty(oldImagePath) && !oldImagePath.Contains("default.jpg"))
        {
            string fullPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", oldImagePath);
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
            }
        }
    }
}