using orbitrush.Database;
using orbitrush.Database.Entities;
using orbitrush.Utils;

namespace orbitrush.Seeders;

public class UserSeeder
{
    private readonly MyDbContext _context;
    public UserSeeder(MyDbContext context)
    {
        _context = context;
    }

    public void Seed()
    {
        User[] users = [
            new User{
                Id = 1,
                Name = "Mr. Utsugi",
                Email = "utsugi@gmail.com",
                HashPassword = PasswordHelper.Hash("Utsugi77"),
                Image = "images/profiles/Mr_Utsugi.webp",
                Role = "admin"
            },
            new User{
                Id = 2,
                Name = "Ralowl",
                Email = "ralowl@gmail.com",
                HashPassword = PasswordHelper.Hash("Ralowl21"),
                Image = "images/profiles/Ralowl.webp",
                Role = "user"
            }
        ];

        _context.Users.AddRange(users);
        _context.SaveChanges();
    }
}
