using orbitrush.Database.Entities;
using orbitrush.Database.Repositories;

namespace orbitrush.Services;

public class UserFriendService
{
    private readonly UnitOfWork _unitOfWork;

    public UserFriendService(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> DeleteUserFriendAsync(int userId, int friendId)
    {
        var userFriends = await _unitOfWork.UserFriendRepository.GetUserFriendsByIdAsync(userId, friendId);
        if (!userFriends.Any())
        {
            return false;
        }
        await _unitOfWork.UserFriendRepository.DeleteUserFriendsAsync(userFriends);
        return true;
    }
}