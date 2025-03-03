using Microsoft.EntityFrameworkCore;
using orbitrush.Database.Entities;
using orbitrush.Database.Entities.Enums;
using orbitrush.Dtos;
using orbitrush.Mappers;
using orbitrush.Utils;

namespace orbitrush.Database.Repositories;

public class UserRepository : Repository<User, int>
{
    public UserRepository(MyDbContext context) : base(context) { }

    public async Task<User> CheckData(string nameLabel, string password)
    {
        string hashPassword = PasswordHelper.Hash(password);
        nameLabel = nameLabel.ToLower();

        User user = await GetQueryable()
         .Where(user => (user.Name.ToLower() == nameLabel || user.Email.ToLower() == nameLabel) && user.HashPassword == hashPassword)
         .FirstOrDefaultAsync();

        return user;
    }

    public async Task<bool> ExistName(string name, int userId = 0)
    {
        return await GetQueryable()
            .AnyAsync(user => user.Name.ToLower() == name.ToLower() && (userId == 0 || user.Id != userId));
    }

    public async Task<bool> ExistEmail(string email, int userId = 0)
    {
        return await GetQueryable()
            .AnyAsync(user => user.Email.ToLower() == email.ToLower() && (userId == 0 || user.Id != userId));
    }

    public async Task<List<UserDto>> GetFriendList(int id)
    {
        User user = await Context.Users
            .Include(u => u.Friends)
            .ThenInclude(f => f.Friend)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
        {
            throw new KeyNotFoundException("Tu usuario no existe");
        }

        if (user.Friends == null || !user.Friends.Any())
        {
            return new List<UserDto>();
        }

        var userMapper = new UserMapper();
        return userMapper.FriendToDtoList(user.Friends);
    }

    public async Task<List<UserDto>> GetUsersExcludingFriends(int userId)
    {
        try
        {
            var allUsers = await Context.Users
                .Where(u => u.Id != userId)
                .ToListAsync();

            var userFriends = await Context.Users
                .Where(u => u.Id == userId)
                .Include(u => u.Friends)
                .ThenInclude(f => f.Friend)
                .Select(u => u.Friends.Select(f => f.FriendId).ToList())
                .FirstOrDefaultAsync();

            if (userFriends == null)
            {
                throw new KeyNotFoundException("Usuario no encontrado");
            }

            var usersExcludingFriends = allUsers
                .Where(user => !userFriends.Contains(user.Id))
                .ToList();

            var result = usersExcludingFriends.Select(user => new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Image = user.Image,
                State = user.State
            }).ToList();

            return result;
        }
        catch (Exception ex)
        {
            throw new Exception("Error buscando usuarios", ex);
        }
    }

    public async Task<List<int>> GetFriendsIdsAsync(int userId)
    {
        return await Context.Users
            .Include(u => u.Friends)
            .ThenInclude(f => f.Friend)
            .Where(u => u.Id == userId)
            .Select(u => u.Friends.Select(f => f.Friend.Id).ToList())
            .FirstOrDefaultAsync();
    }

    public async Task UpdateStateAsync(int userId, StateEnum newState)
    {
        User user = await Context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user != null)
        {
            user.State = newState;
            await Context.SaveChangesAsync();
        }
    }

    public async Task<List<string>> GetFriendByNames(int id)
    {
        var friends = await GetFriendList(id);

        return friends.Select(f => f.Name).ToList();
    }

    public async Task<List<string>> GetUserByNames(int id)
    {
        var users = await GetUsersExcludingFriends(id);

        return users.Select(u => u.Name).ToList();
    }
    public async Task<List<User>> GetFriendsByMatchedNames(int userId, IEnumerable<string> matchedNames)
    {
        return await Context.Friends
            .Where(f => f.UserId == userId && matchedNames.Contains(f.Friend.Name))
            .Select(f => f.Friend)
            .ToListAsync();
    }
    public async Task<List<User>> GetUsersByMatchedNames(IEnumerable<string> matchedNames)
    {
        return await Context.Users
            .Where(u => matchedNames.Contains(u.Name))
            .ToListAsync();
    }

    public async Task<User> GetUserWithMatchesAsync(int userId)
    {
        var user = await Context.Users
        .Include(u => u.MatchResults)
            .ThenInclude(mr => mr.Match)
            .ThenInclude(m => m.Results)
            .ThenInclude(r => r.User)
        .FirstOrDefaultAsync(u => u.Id == userId);

        if (user != null)
        {
            user.MatchResults = user.MatchResults
                .OrderByDescending(mr => mr.Match.MatchDate)
                .ToList();
        }

        return user;
    }

    public async Task<List<User>> GetAllUsersAsync()
    {
        return await Context.Users.ToListAsync();
    }

    public async Task<bool> UpdateUserRoleAsync(int userId, string newRole)
    {
        var user = await Context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
            return false;

        user.Role = newRole;
        await Context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ToggleBanUserAsync(int userId)
    {
        var user = await Context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
            return false;

        user.IsBanned = !user.IsBanned;
        await Context.SaveChangesAsync();
        return true;
    }

}