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
            Email = user.Email,
            Image = user.Image,
            Role = user.Role,
            State = user.State,
            IsBanned = user.IsBanned
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

    public UserDto UserMatchesDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Image = user.Image,
            Email = user.Email,
            Role = user.Role,
            State = user.State,
            Matches = user.MatchResults.Select(mr => new MatchDto
            {
                Id = mr.Match.Id,
                MatchDate = mr.Match.MatchDate,
                Duration = mr.Match.Duration,
                Result = mr.Result,
                OpponentName = mr.Match.Results.FirstOrDefault(x => x.UserId != user.Id)?.User?.Name
            }).ToList()
        };
    }

    public static UserProfileDto UserToProfileDto(User user)
    {
        return new UserProfileDto
        {
            Id = user.Id,
            Name = user.Name,
            Image = user.Image,
            State = user.State,
            Matches = user.MatchResults.Select(mr => new MatchDto
            {
                Id = mr.Match.Id,
                MatchDate = mr.Match.MatchDate,
                Duration = mr.Match.Duration,
                Result = mr.Result,
                OpponentName = mr.Match.Results.FirstOrDefault(x => x.UserId != user.Id)?.User?.Name
            }).ToList()
        };
    }
}