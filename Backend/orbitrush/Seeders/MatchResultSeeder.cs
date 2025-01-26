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
        ];

        _context.MatchResults.AddRange(results);
        _context.SaveChanges();
    }
}