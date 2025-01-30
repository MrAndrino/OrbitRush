using orbitrush.Database.Entities;
using orbitrush.Dtos;

namespace orbitrush.Mappers;

public static class UserMapper
{
    public static UserDto ToDto(UserFriend userFriend)
    {
        return new UserDto
        {
            Id = userFriend.Friend.Id,
            Name = userFriend.Friend.Name,
            Image = userFriend.Friend.Image,
            State = userFriend.Friend.State,
        };
    }

    public static List<UserDto> ToDtoList(List<UserFriend> userFriends)
    {
        return userFriends.Select(ToDto).ToList();
    }
}