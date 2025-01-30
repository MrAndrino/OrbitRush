﻿using Microsoft.EntityFrameworkCore;
using orbitrush.Database.Entities;
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

    public async Task<List<UserFriendDto>> GetFriendList(int id)
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
            return new List<UserFriendDto>();
        }

        return UserFriendMapper.ToDtoList(user.Friends);
    }

    public async Task<List<UserFriendDto>> GetUsersExcludingFriends(int userId)
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
                throw new KeyNotFoundException("User or friends not found");
            }

            var usersExcludingFriends = allUsers
                .Where(user => !userFriends.Contains(user.Id))
                .ToList();

            var result = usersExcludingFriends.Select(user => new UserFriendDto
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
            throw new Exception("Error retrieving users excluding friends", ex);
        }
    }


}