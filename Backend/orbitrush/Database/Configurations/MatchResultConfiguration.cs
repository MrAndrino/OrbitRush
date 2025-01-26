using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using orbitrush.Database.Entities;

namespace orbitrush.Database.Configurations;

public class MatchResultConfiguration : IEntityTypeConfiguration<MatchResult>
{
    public void Configure(EntityTypeBuilder<MatchResult> entity)
    {
        // TABLA
        entity.ToTable("match_results");

        entity.HasKey(e => e.Id);
        entity.Property(e => e.Id)
              .HasColumnName("id")
              .IsRequired()
              .ValueGeneratedOnAdd();

        entity.Property(e => e.Result)
              .HasColumnName("result")
              .IsRequired();

        entity.Property(e => e.UserId)
              .HasColumnName("user_id")
              .IsRequired();
        entity.Property(e => e.MatchId)
              .HasColumnName("match_id")
              .IsRequired();

        // RELACIONES
        entity.HasOne(e => e.Match)
              .WithMany(m => m.Results)
              .HasForeignKey(e => e.MatchId);

        entity.HasOne(e => e.User)
              .WithMany(u => u.MatchResults)
              .HasForeignKey(e => e.UserId);
    }
}