using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using orbitrush.Database.Entities;

namespace orbitrush.Database.Configurations;

public class UserFriendConfiguration : IEntityTypeConfiguration<UserFriend>
{
    public void Configure(EntityTypeBuilder<UserFriend> entity)
    {
        // TABLA
        entity.ToTable("user_friends");

        entity.HasKey(e => new { e.UserId, e.FriendId });
        entity.Property(e => e.UserId)
              .HasColumnName("user_id")
              .IsRequired();
        entity.Property(e => e.FriendId)
              .HasColumnName("friend_id")
              .IsRequired();


        // RELACIONES
        entity.HasOne(e => e.User)
              .WithMany(u => u.Friends)
              .HasForeignKey(e => e.UserId);

        entity.HasOne(e => e.Friend)
              .WithMany()
              .HasForeignKey(e => e.FriendId);
    }
}