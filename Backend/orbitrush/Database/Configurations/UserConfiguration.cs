using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using orbitrush.Database.Entities;

namespace orbitrush.Database.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> entity)
    {

        // TABLA
        entity.ToTable("users");

        entity.HasKey(e => e.Id);
        entity.Property(e => e.Id)
              .HasColumnName("id")
              .IsRequired()
              .ValueGeneratedOnAdd();

        entity.Property(e => e.Name)
              .HasColumnName("name")
              .HasMaxLength(20)
              .IsRequired();
        entity.HasIndex(e => e.Name)
              .IsUnique();

        entity.Property(e => e.Email)
              .HasColumnName("email")
              .HasMaxLength(20)
              .IsRequired();
        entity.HasIndex(e => e.Email)
              .IsUnique();

        entity.Property(e => e.HashPassword)
              .HasColumnName("hash_password")
              .HasMaxLength(20)
              .IsRequired();

        entity.Property(e => e.Image)
              .HasColumnName("image")
              .HasMaxLength(255)
              .IsRequired();

        entity.Property(e => e.Role)
             .HasColumnName("role")
             .IsRequired();

        entity.Property(e => e.State)
              .HasColumnName("state")
              .IsRequired();


        // RELACIONES
        entity.HasMany(e => e.MatchResults)
              .WithOne(mr => mr.User)
              .HasForeignKey(e => e.UserId);
    }
}