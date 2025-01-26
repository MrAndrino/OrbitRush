using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace orbitrush.Database.Entities;

public class Match
{
    public int Id { get; set; }

    public DateTime MatchDate { get; set; } = DateTime.UtcNow;


    public List<MatchResult> Results { get; set; } = new();
}