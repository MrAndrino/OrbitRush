using Microsoft.EntityFrameworkCore;
using orbitrush.Database.Entities;
using orbitrush.Utils;

namespace orbitrush.Database.Repositories;

public class UserRepository : Repository<User, int>
{
    public UserRepository(MyDbContext context) : base(context) { }

    public async Task<User> CheckData(string name, string email, string password)
    {
        string hashPassword = PasswordHelper.Hash(password);

        var user = await GetQueryable()
         .FirstOrDefaultAsync(user =>
             (string.IsNullOrEmpty(name) || user.Name == name) &&
             (string.IsNullOrEmpty(email) || user.Email == email) &&
             user.HashPassword == hashPassword);

        Console.WriteLine($"user: {user}");
        return user;
    }










    //public async Task<bool>
}