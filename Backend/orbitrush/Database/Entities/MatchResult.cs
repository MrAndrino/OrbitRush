using orbitrush.Database.Entities.Enums;

namespace orbitrush.Database.Entities;

public class MatchResult
{
    public int Id { get; set; }


    public int MatchId { get; set; }
    public Match Match { get; set; }


    public int UserId { get; set; }
    public User User { get; set; }

    public MatchResultEnum Result { get; set; }
}