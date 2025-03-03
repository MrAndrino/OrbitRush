using orbitrush.Database.Entities.Enums;

namespace orbitrush.Dtos;

public class MatchDto
{
    public int Id { get; set; }
    public DateTime MatchDate { get; set; }
    public TimeSpan Duration { get; set; }
    public MatchResultEnum Result { get; set; }

    public string OpponentName { get; set; }
}
