using orbitrush.Database.Entities;
using orbitrush.Dtos;

namespace orbitrush.Mappers;

public static class UserFriendMapper
{
    public static UserFriendDto ToDto(UserFriend userFriend)
    {
        return new UserFriendDto
        {
            Id = userFriend.Friend.Id,
            Name = userFriend.Friend.Name,
            Image = userFriend.Friend.Image
        };
    }

    public static List<UserFriendDto> ToDtoList(List<UserFriend> userFriends)
    {
        return userFriends.Select(ToDto).ToList();
    }
}