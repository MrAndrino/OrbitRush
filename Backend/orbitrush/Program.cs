using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using orbitrush.Database;
using orbitrush.Database.Repositories;
using orbitrush.Seeders;
using orbitrush.Services;
using System.Text;

namespace orbitrush;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddScoped<MyDbContext>();
        builder.Services.AddScoped<UnitOfWork>();
        builder.Services.AddScoped<UserService>();
        builder.Services.AddScoped<UserFriendService>();
        builder.Services.AddSingleton<WSConnectionManager>();
        builder.Services.AddSingleton<WSFriendHandler>();
        builder.Services.AddSingleton<WebSocketService>();

        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen(options =>
        {
            options.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, new OpenApiSecurityScheme
            {
                BearerFormat = "JWT",
                Name = "Authorization",
                Description = "Escribe SOLO tu token JWT",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.Http,
                Scheme = JwtBearerDefaults.AuthenticationScheme
            });

            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = JwtBearerDefaults.AuthenticationScheme
                        }
                    },
                    new string[] { }
                }
             });
        });

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


        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowAllOrigins", policy =>
            {
                policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
            });
        });


        static void SeedDatabase(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            using MyDbContext dbContext = scope.ServiceProvider.GetService<MyDbContext>();

            if (dbContext.Database.EnsureCreated())
            {
                UserSeeder userSeeder = new UserSeeder(dbContext);
                userSeeder.Seed();
                MatchSeeder matchSeeder = new MatchSeeder(dbContext);
                matchSeeder.Seed();
                MatchResultSeeder matchResultSeeder = new MatchResultSeeder(dbContext);
                matchResultSeeder.Seed();
                FriendSeeder friendSeeder = new FriendSeeder(dbContext);
                friendSeeder.Seed();
            }
        }


        var app = builder.Build();

        app.UseStaticFiles();

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseCors("AllowAllOrigins");
        app.UseHttpsRedirection();

        app.UseWebSockets();

        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();

        SeedDatabase(app.Services);
        app.Run();
    }
}