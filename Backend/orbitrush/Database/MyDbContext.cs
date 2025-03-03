using Microsoft.EntityFrameworkCore;
using orbitrush.Database.Entities;

namespace orbitrush.Database;

public class MyDbContext : DbContext
{
    private const string DATABASE_PATH = "orbitrush.db";


    public MyDbContext() { }
    public MyDbContext(DbContextOptions<MyDbContext> options) : base(options) { }


    //Creación de Tablas
    public DbSet<User> Users { get; set; }
    public DbSet<Match> Matches { get; set; }
    public DbSet<MatchResult> MatchResults { get; set; }
    public DbSet<UserFriend> Friends { get; set; }
    public DbSet<FriendRequest> FriendRequest { get; set; }


    protected override void OnConfiguring(DbContextOptionsBuilder options)
    {
        string baseDir = AppDomain.CurrentDomain.BaseDirectory;
#if DEBUG

        options.UseSqlite($"DataSource={baseDir}{DATABASE_PATH}");

#elif RELEASE
        options.UseMySql(Environment.GetEnvironmentVariable("OR_DATABASE_CONFIG"), ServerVersion.AutoDetect(Environment.GetEnvironmentVariable("OR_DATABASE_CONFIG")));
#endif
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(MyDbContext).Assembly);
    }

}