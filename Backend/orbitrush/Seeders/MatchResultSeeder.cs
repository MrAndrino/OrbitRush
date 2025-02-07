using orbitrush.Database;
using orbitrush.Database.Entities;
using orbitrush.Database.Entities.Enums;

namespace orbitrush.Seeders;

public class MatchResultSeeder
{
    private readonly MyDbContext _context;
    public MatchResultSeeder(MyDbContext context)
    {
        _context = context;
    }

    public void Seed()
    {
        MatchResult[] results = [
            new MatchResult{
                Id = 1,
                MatchId = 1,
                UserId = 1,
                Result = MatchResultEnum.Victory
            },
            new MatchResult{
                Id = 2,
                MatchId = 1,
                UserId = 2,
                Result = MatchResultEnum.Defeat
            },
            new MatchResult{
                Id = 3,
                MatchId = 2,
                UserId = 1,
                Result = MatchResultEnum.Victory
            },
            new MatchResult{
                Id = 4,
                MatchId = 2,
                UserId = 4,
                Result = MatchResultEnum.Defeat
            },
            new MatchResult{
                Id = 5,
                MatchId = 3,
                UserId = 4,
                Result = MatchResultEnum.Draw
            },
            new MatchResult{
                Id = 6,
                MatchId = 3,
                UserId = 5,
                Result = MatchResultEnum.Draw
            },
            new MatchResult{
                Id = 7,
                MatchId = 4,
                UserId = 1,
                Result = MatchResultEnum.Victory
            },
            new MatchResult{
                Id = 8,
                MatchId = 4,
                UserId = 2,
                Result = MatchResultEnum.Defeat
            },
            new MatchResult{
                Id = 9,
                MatchId = 5,
                UserId = 1,
                Result = MatchResultEnum.Defeat
            },
            new MatchResult{
                Id = 10,
                MatchId = 5,
                UserId = 4,
                Result = MatchResultEnum.Defeat
            },
            new MatchResult{
                Id = 11,
                MatchId = 6,
                UserId = 4,
                Result = MatchResultEnum.Draw
            },
            new MatchResult{
                Id = 12,
                MatchId = 6,
                UserId = 5,
                Result = MatchResultEnum.Draw
            },
            new MatchResult{
                Id = 13,
                MatchId = 7,
                UserId = 1,
                Result = MatchResultEnum.Victory
            },
            new MatchResult{
                Id = 14,
                MatchId = 7,
                UserId = 2,
                Result = MatchResultEnum.Defeat
            },
            new MatchResult{
                Id = 15,
                MatchId = 8,
                UserId = 1,
                Result = MatchResultEnum.Victory
            },
            new MatchResult{
                Id = 16,
                MatchId = 8,
                UserId = 4,
                Result = MatchResultEnum.Victory
            },
            new MatchResult{
                Id = 17,
                MatchId = 9,
                UserId = 4,
                Result = MatchResultEnum.Draw
            },
            new MatchResult{
                Id = 18,
                MatchId = 9,
                UserId = 5,
                Result = MatchResultEnum.Draw
            },
            new MatchResult{
                Id = 19,
                MatchId = 10,
                UserId = 1,
                Result = MatchResultEnum.Draw
            },
            new MatchResult{
                Id = 20,
                MatchId = 10,
                UserId = 2,
                Result = MatchResultEnum.Defeat
            },
        ];

        _context.MatchResults.AddRange(results);
        _context.SaveChanges();
    }
}