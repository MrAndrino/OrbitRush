using orbitrush.Database.Entities;

namespace orbitrush.Database.Repositories;

public class MatchResultRepository : Repository<MatchResult, int>
{
    public MatchResultRepository(MyDbContext context) : base(context) { }
}
