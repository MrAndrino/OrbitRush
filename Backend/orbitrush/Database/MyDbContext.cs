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


    protected override void OnConfiguring(DbContextOptionsBuilder options)
    {
        string baseDir = AppDomain.CurrentDomain.BaseDirectory;

        options.UseSqlite($"DataSource={baseDir}{DATABASE_PATH}");
    }
}