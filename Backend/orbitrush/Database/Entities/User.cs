using orbitrush.Database.Entities.Enums;

namespace orbitrush.Database.Entities;

public class User
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public required string HashPassword { get; set; }
    public string Image { get; set; }
    public required string Role { get; set; }
    public StateEnum State { get; set; }
}