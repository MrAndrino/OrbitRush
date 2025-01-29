using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using orbitrush.Database.Entities;

namespace orbitrush.Database.Configurations;

public class FriendRequestConfiguration : IEntityTypeConfiguration<FriendRequest>
{
    public void Configure(EntityTypeBuilder<FriendRequest> entity)
    {
        // TABLA
        entity.ToTable("friend_request");

        entity.HasKey(e => e.Id);
        entity.Property(e => e.Id)
              .HasColumnName("id")
              .IsRequired()
              .ValueGeneratedOnAdd();

        entity.Property(e => e.SenderId)
              .HasColumnName("sender_id")
              .IsRequired();

        entity.Property(e => e.TargetId)
              .HasColumnName("target_id")
              .IsRequired();

        entity.HasIndex(e => new { e.SenderId, e.TargetId })
              .IsUnique();

        // RELACIONES
    }
}
