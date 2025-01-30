using orbitrush.Database.Entities;
using orbitrush.Dtos;

namespace orbitrush.Mappers;

public class UserMapper
{
    public UserDto FriendToDto(UserFriend userFriend)
    {
        return new UserDto
        {
            Id = userFriend.Friend.Id,
            Name = userFriend.Friend.Name,
            Image = userFriend.Friend.Image,
            State = userFriend.Friend.State,
        };
    }

    public UserDto UserToDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Image = user.Image,
            State = user.State,
        };
    }

    public List<UserDto> UserToDtoList(List<User> user)
    {
        return user.Select(UserToDto).ToList();
    }

    public List<UserDto> FriendToDtoList(List<UserFriend> userFriends)
    {
        return userFriends.Select(FriendToDto).ToList();
    }
}