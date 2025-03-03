using orbitrush.Database;
using orbitrush.Database.Entities;

namespace orbitrush.Seeders;

public class FriendSeeder
{
    private readonly MyDbContext _context;
    public FriendSeeder(MyDbContext context)
    {
        _context = context;
    }

    public void Seed()
    {
        UserFriend[] friends = [
            new UserFriend{ UserId = 1, FriendId = 2 },
            new UserFriend{ UserId = 2, FriendId = 1 },

            new UserFriend{ UserId = 1, FriendId = 3 },
            new UserFriend{ UserId = 3, FriendId = 1 },

            new UserFriend{ UserId = 1, FriendId = 4 },
            new UserFriend{ UserId = 4, FriendId = 1 },

            new UserFriend{ UserId = 1, FriendId = 5 },
            new UserFriend{ UserId = 5, FriendId = 1 },

            new UserFriend{ UserId = 2, FriendId = 4 },
            new UserFriend{ UserId = 4, FriendId = 2 },

            new UserFriend{ UserId = 3, FriendId = 4 },
            new UserFriend{ UserId = 4, FriendId = 3 }
        ];

        _context.Friends.AddRange(friends);
        _context.SaveChanges();
    }
}
