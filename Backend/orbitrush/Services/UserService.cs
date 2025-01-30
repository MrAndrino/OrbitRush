using orbitrush.Database.Entities;
using orbitrush.Database.Repositories;
using orbitrush.Dtos;
using orbitrush.Mappers;

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
}