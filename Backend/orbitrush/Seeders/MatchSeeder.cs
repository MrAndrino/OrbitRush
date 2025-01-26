using orbitrush.Database;
using orbitrush.Database.Entities;

namespace orbitrush.Seeders;

public class MatchSeeder
{
    private readonly MyDbContext _context;
    public MatchSeeder(MyDbContext context)
    {
        _context = context;
    }

    public void Seed()
    {
        Match[] matches = [
            new Match{ Id = 1, MatchDate = DateTime.UtcNow },
            new Match{ Id = 2, MatchDate = DateTime.UtcNow.AddDays(-1) },
            new Match{ Id = 3, MatchDate = DateTime.UtcNow.AddDays(-2) }
            ];

        _context.Matches.AddRange(matches);
        _context.SaveChanges();
    }
}
