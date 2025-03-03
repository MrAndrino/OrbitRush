using Microsoft.EntityFrameworkCore;
using orbitrush.Database.Entities;

namespace orbitrush.Database.Repositories;

public class FriendRequestRepository : Repository<FriendRequest, int>
{
    public async Task<IEnumerable<FriendRequest>> GetRequestsByTargetIdAsync(string targetId)
    {
        return await Context.FriendRequest
            .Where(fr => fr.TargetId == targetId)
            .ToListAsync();
    }
    public FriendRequestRepository(MyDbContext context) : base(context) { }

    public async Task<bool> ExistsBySenderAndTargetAsync(string senderId, string targetId)
    {
        return await Context.FriendRequest
            .AnyAsync(r => r.SenderId == senderId && r.TargetId == targetId);
    }

    public async Task<FriendRequest> FindBySenderAndTargetAsync(string targetId, string accepterId)
    {
        return await Context.FriendRequest
            .FirstOrDefaultAsync(r => r.SenderId == targetId && r.TargetId == accepterId);
    }
}