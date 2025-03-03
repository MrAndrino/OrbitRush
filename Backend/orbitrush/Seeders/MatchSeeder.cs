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
            new Match{ Id = 1, MatchDate = new DateTime(2025, 1, 24), Duration = TimeSpan.FromMinutes(5).Add(TimeSpan.FromSeconds(30)) },
            new Match{ Id = 2, MatchDate = new DateTime(2025, 1, 24), Duration = TimeSpan.FromMinutes(7).Add(TimeSpan.FromSeconds(15)) },
            new Match{ Id = 3, MatchDate = new DateTime(2025, 1, 24), Duration = TimeSpan.FromMinutes(3).Add(TimeSpan.FromSeconds(45)) },
            new Match{ Id = 4, MatchDate = new DateTime(2025, 1, 26), Duration = TimeSpan.FromMinutes(10).Add(TimeSpan.FromSeconds(10)) },
            new Match{ Id = 5, MatchDate = new DateTime(2025, 1, 26), Duration = TimeSpan.FromMinutes(8).Add(TimeSpan.FromSeconds(50)) },
            new Match{ Id = 6, MatchDate = new DateTime(2025, 2, 1), Duration = TimeSpan.FromMinutes(6).Add(TimeSpan.FromSeconds(20)) },
            new Match{ Id = 7, MatchDate = new DateTime(2025, 2, 1), Duration = TimeSpan.FromMinutes(12).Add(TimeSpan.FromSeconds(5)) },
            new Match{ Id = 8, MatchDate = new DateTime(2025, 2, 1), Duration = TimeSpan.FromMinutes(9).Add(TimeSpan.FromSeconds(35)) },
            new Match{ Id = 9, MatchDate = new DateTime(2025, 2, 4), Duration = TimeSpan.FromMinutes(4).Add(TimeSpan.FromSeconds(25)) },
            new Match{ Id = 10, MatchDate = new DateTime(2025, 2, 7), Duration = TimeSpan.FromMinutes(11).Add(TimeSpan.FromSeconds(40)) },
            ];

        _context.Matches.AddRange(matches);
        _context.SaveChanges();
    }
}
