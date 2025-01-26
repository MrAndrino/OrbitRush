using orbitrush.Database;
using orbitrush.Database.Entities;
using orbitrush.Database.Entities.Enums;
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
                Role = "admin",
                State = StateEnum.Disconnected
            },
            new User{
                Id = 2,
                Name = "Ralowl",
                Email = "ralowl@gmail.com",
                HashPassword = PasswordHelper.Hash("Ralowl21"),
                Image = "images/profiles/Ralowl.webp",
                Role = "user",
                State = StateEnum.Disconnected
            },
            new User{
                Id = 3,
                Name = "Sayetsu",
                Email = "sayetsu@gmail.com",
                HashPassword = PasswordHelper.Hash("Sayetsu13"),
                Image = "images/OrbitRush-TrashCan.jpg",
                Role = "user",
                State = StateEnum.Disconnected
            },
            new User{
                Id = 4,
                Name = "Pixeladu",
                Email = "pixeladu@gmail.com",
                HashPassword = PasswordHelper.Hash("Pixeladu24"),
                Image = "images/OrbitRush-TrashCan.jpg",
                Role = "user",
                State = StateEnum.Disconnected
            },
            new User{
                Id = 5,
                Name = "Fernando",
                Email = "fernando@gmail.com",
                HashPassword = PasswordHelper.Hash("Fernando3"),
                Image = "images/OrbitRush-TrashCan.jpg",
                Role = "user",
                State = StateEnum.Disconnected
            }
        ];

        _context.Users.AddRange(users);
        _context.SaveChanges();
    }
}
