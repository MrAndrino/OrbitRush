﻿using Microsoft.EntityFrameworkCore;
using orbitrush.Database.Entities;
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

    public async Task<bool> ExistName(string name)
    {
        User user = await GetQueryable()
            .FirstOrDefaultAsync(user => user.Name.ToLower() == name.ToLower());

        if (user == null)
        {
            return false;
        }
        return true;
    }

    public async Task<bool> ExistEmail(string email)
    {
        User user = await GetQueryable()
            .FirstOrDefaultAsync(user => user.Email.ToLower() == email.ToLower());

        if (user == null)
        {
            return false;
        }
        return true;
    }
}