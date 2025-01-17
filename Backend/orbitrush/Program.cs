using Microsoft.IdentityModel.Tokens;
using orbitrush.Database;
using orbitrush.Database.Repositories;
using orbitrush.Seeders;
using System.Text;

namespace orbitrush;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddScoped<MyDbContext>();
        builder.Services.AddScoped<UnitOfWork>();

        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();
        builder.Services.AddAuthentication()
            .AddJwtBearer(options =>
        {
            string key = Environment.GetEnvironmentVariable("JWT_KEY");
            options.TokenValidationParameters = new TokenValidationParameters()
            {
                ValidateIssuer = false,
                ValidateAudience = false,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key))
            };
        });


        static void SeedDatabase(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            using MyDbContext dbContext = scope.ServiceProvider.GetService<MyDbContext>();

            if (dbContext.Database.EnsureCreated())
            {
                UserSeeder userSeeder = new UserSeeder(dbContext);
                userSeeder.Seed();
            }
        }


        var app = builder.Build();

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseHttpsRedirection();

        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();

        SeedDatabase(app.Services);
        app.Run();
    }
}