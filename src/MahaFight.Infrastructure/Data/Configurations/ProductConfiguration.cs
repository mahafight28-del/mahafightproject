using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MahaFight.Domain.Entities;

namespace MahaFight.Infrastructure.Data.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("products");
        
        builder.HasKey(e => e.Id);
        
        // Basic properties
        builder.Property(e => e.Id).HasColumnName("id");
        builder.Property(e => e.Sku).HasColumnName("sku").IsRequired().HasMaxLength(50);
        builder.Property(e => e.Name).HasColumnName("name").IsRequired().HasMaxLength(100);
        builder.Property(e => e.Description).HasColumnName("description");
        builder.Property(e => e.Category).HasColumnName("category").IsRequired().HasMaxLength(50);
        builder.Property(e => e.Brand).HasColumnName("brand").HasMaxLength(50);
        builder.Property(e => e.UnitPrice).HasColumnName("unit_price").HasPrecision(10, 2).IsRequired();
        builder.Property(e => e.CostPrice).HasColumnName("cost_price").HasPrecision(10, 2).IsRequired();
        builder.Property(e => e.Weight).HasColumnName("weight").HasPrecision(8, 2);
        builder.Property(e => e.Dimensions).HasColumnName("dimensions").HasMaxLength(50);
        builder.Property(e => e.StockQuantity).HasColumnName("stock_quantity").IsRequired().HasDefaultValue(0);
        builder.Property(e => e.MinStockLevel).HasColumnName("min_stock_level").HasDefaultValue(10);
        builder.Property(e => e.IsActive).HasColumnName("is_active").IsRequired().HasDefaultValue(true);
        
        // CRITICAL: QR/Barcode column mappings
        builder.Property(e => e.Barcode)
            .HasColumnName("barcode")
            .HasMaxLength(100);
            
        builder.Property(e => e.QrCode)
            .HasColumnName("qr_code")
            .HasMaxLength(500);
            
        builder.Property(e => e.QrCodeExpiresAt)
            .HasColumnName("qr_code_expires_at");
        
        // Timestamps
        builder.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(e => e.UpdatedAt).HasColumnName("updated_at");
        
        // Indexes
        builder.HasIndex(e => e.Sku).IsUnique();
    }
}