using orbitrush.Database.Entities.Enums;

namespace orbitrush.Database.Entities;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string HashPassword { get; set; }
    public string Image { get; set; }
    public string Role { get; set; }
    public StateEnum State { get; set; }
    public bool IsBanned { get; set; } = false;


    public List<UserFriend> Friends { get; set; }
    public List<MatchResult> MatchResults { get; set; }

}