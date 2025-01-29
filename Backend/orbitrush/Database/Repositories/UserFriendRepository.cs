using Microsoft.EntityFrameworkCore;
using orbitrush.Database.Entities;

namespace orbitrush.Database.Repositories;

public class UserFriendRepository : Repository<UserFriend, int>
{
    public UserFriendRepository(MyDbContext context) : base(context) { }

    public async Task<IEnumerable<UserFriend>> GetUserFriendsByIdAsync(int userId, int friendId)
    {
        return await Context.Set<UserFriend>()
            .Where(uf => (uf.UserId == userId && uf.FriendId == friendId) || (uf.UserId == friendId && uf.FriendId == userId))
            .ToListAsync();
    }

    public async Task DeleteUserFriendsAsync(IEnumerable<UserFriend> userFriends)
    {
        Context.Set<UserFriend>().RemoveRange(userFriends);
        await Context.SaveChangesAsync();
    }
}
