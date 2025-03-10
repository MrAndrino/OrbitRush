﻿namespace orbitrush.Database.Entities;

public class Match
{
    public int Id { get; set; }

    public DateTime MatchDate { get; set; } = DateTime.UtcNow;

    public TimeSpan Duration { get; set; }

    public List<MatchResult> Results { get; set; } = new();
}