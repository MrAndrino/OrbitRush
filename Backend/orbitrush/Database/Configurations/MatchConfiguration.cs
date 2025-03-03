using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using orbitrush.Database.Entities;

namespace orbitrush.Database.Configurations;

public class MatchConfiguration : IEntityTypeConfiguration<Match>
{
    public void Configure(EntityTypeBuilder<Match> entity)
    {
        // TABLA
        entity.ToTable("matchs");

        entity.HasKey(e => e.Id);
        entity.Property(e => e.Id)
              .HasColumnName("id")
              .IsRequired()
              .ValueGeneratedOnAdd();

        entity.Property(e => e.MatchDate)
              .HasColumnName("match_date")
              .HasColumnType("date")
              .IsRequired();

        // RELACIONES
        entity.HasMany(e => e.Results)
              .WithOne(r => r.Match)
              .HasForeignKey(e => e.MatchId);
    }
}