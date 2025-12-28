using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MahaFight.Domain.Entities;

namespace MahaFight.Infrastructure.Data.Configurations;

public class EmailOtpConfiguration : IEntityTypeConfiguration<EmailOtp>
{
    public void Configure(EntityTypeBuilder<EmailOtp> builder)
    {
        builder.ToTable("email_otps");
        
        builder.HasKey(e => e.Id);
        
        // Explicit snake_case column mappings with quotes for PostgreSQL
        builder.Property(e => e.Id)
            .HasColumnName("\"id\"");
            
        builder.Property(e => e.Email)
            .HasColumnName("\"email\"")
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(e => e.OtpHash)
            .HasColumnName("\"otp_hash\"")
            .IsRequired()
            .HasMaxLength(255);
            
        builder.Property(e => e.Purpose)
            .HasColumnName("\"purpose\"")
            .IsRequired()
            .HasConversion<int>();
            
        builder.Property(e => e.ExpiresAt)
            .HasColumnName("\"expires_at\"")
            .IsRequired();
            
        builder.Property(e => e.IsUsed)
            .HasColumnName("\"is_used\"")
            .HasDefaultValue(false);
            
        builder.Property(e => e.AttemptCount)
            .HasColumnName("\"attempt_count\"")
            .HasDefaultValue(0);
            
        builder.Property(e => e.UserAgent)
            .HasColumnName("\"user_agent\"")
            .HasMaxLength(500);
            
        builder.Property(e => e.IpAddress)
            .HasColumnName("\"ip_address\"")
            .HasMaxLength(50);
            
        builder.Property(e => e.CreatedAt)
            .HasColumnName("\"created_at\"")
            .IsRequired();
            
        builder.Property(e => e.UpdatedAt)
            .HasColumnName("\"updated_at\"");
            
        // Indexes for performance
        builder.HasIndex(e => new { e.Email, e.Purpose, e.IsUsed, e.ExpiresAt })
            .HasDatabaseName("idx_email_otps_lookup");
    }
}