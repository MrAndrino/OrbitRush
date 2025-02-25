using orbitrush.Database.Entities;

namespace orbitrush.Database.Repositories;

public class MatchRepository: Repository<Match, int>
{
    public MatchRepository(MyDbContext context) : base(context) { }
}
