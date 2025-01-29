﻿namespace orbitrush.Database.Repositories;

public class UnitOfWork
{
    private readonly MyDbContext _myDbContext;
    private UserRepository _userRepository;
    private FriendRequestRepository _friendRequestRepository;
    private UserFriendRepository _userFriendRepository;

    public UserRepository UserRepository => _userRepository ??= new UserRepository(_myDbContext);
    public FriendRequestRepository FriendRequestRepository => _friendRequestRepository ??= new FriendRequestRepository(_myDbContext);
    public UserFriendRepository UserFriendRepository => _userFriendRepository ??= new UserFriendRepository(_myDbContext);


    public UnitOfWork(MyDbContext myDbContext) { 
    
        _myDbContext=myDbContext;

    }

    public async Task<bool> SaveAsync()
    {
        return await _myDbContext.SaveChangesAsync() > 0;
    }
}