using orbitrush.Database.Entities.Enums;

namespace orbitrush.Dtos;

public class UserDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string Image { get; set; }
    public string Role { get; set; }
    public StateEnum State { get; set; }
    public bool IsBanned { get; set; }
    public List<MatchDto> Matches { get; set; }
}
