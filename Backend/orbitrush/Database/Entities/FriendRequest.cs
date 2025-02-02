namespace orbitrush.Database.Entities;

public class FriendRequest
{
    public int Id { get; set; }
    public string SenderId { get; set; }
    public string TargetId { get; set; }
}
