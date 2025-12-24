using Microsoft.EntityFrameworkCore;
using MahaFight.Domain.Entities;

namespace MahaFight.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Dealer> Dealers { get; set; }
    public DbSet<DealerKyc> DealerKyc { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<Sale> Sales { get; set; }
    public DbSet<SaleItem> SaleItems { get; set; }
    public DbSet<Invoice> Invoices { get; set; }
    public DbSet<Commission> Commissions { get; set; }
    public DbSet<Franchise> Franchises { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }
    public DbSet<Cart> Carts { get; set; }
    public DbSet<CartItem> CartItems { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<ProductImage> ProductImages { get; set; }
    public DbSet<PasswordResetOtp> PasswordResetOtps { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Email).HasColumnName("email").IsRequired().HasMaxLength(100);
            entity.Property(e => e.PasswordHash).HasColumnName("password_hash").IsRequired().HasMaxLength(255);
            entity.Property(e => e.FirstName).HasColumnName("first_name").IsRequired().HasMaxLength(50);
            entity.Property(e => e.LastName).HasColumnName("last_name").IsRequired().HasMaxLength(50);
            entity.Property(e => e.Phone).HasColumnName("phone").HasMaxLength(20);
            entity.Property(e => e.Role).HasColumnName("role").IsRequired().HasMaxLength(20).HasDefaultValue("User");
            entity.Property(e => e.IsActive).HasColumnName("is_active").IsRequired().HasDefaultValue(true);
            entity.Property(e => e.Address).HasColumnName("address");
            entity.Property(e => e.City).HasColumnName("city").HasMaxLength(50);
            entity.Property(e => e.State).HasColumnName("state").HasMaxLength(50);
            entity.Property(e => e.PinCode).HasColumnName("pin_code").HasMaxLength(10);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.HasIndex(e => e.Email).IsUnique();
        });

        // Dealer configuration
        modelBuilder.Entity<Dealer>(entity =>
        {
            entity.ToTable("dealers");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
            entity.Property(e => e.BusinessName).HasColumnName("business_name").IsRequired().HasMaxLength(100);
            entity.Property(e => e.BusinessType).HasColumnName("business_type").IsRequired().HasMaxLength(50);
            entity.Property(e => e.RegistrationNumber).HasColumnName("registration_number").HasMaxLength(50);
            entity.Property(e => e.TaxId).HasColumnName("tax_id").HasMaxLength(50);
            entity.Property(e => e.Address).HasColumnName("address").IsRequired();
            entity.Property(e => e.City).HasColumnName("city").IsRequired().HasMaxLength(50);
            entity.Property(e => e.State).HasColumnName("state").IsRequired().HasMaxLength(50);
            entity.Property(e => e.PostalCode).HasColumnName("postal_code").IsRequired().HasMaxLength(20);
            entity.Property(e => e.Country).HasColumnName("country").IsRequired().HasMaxLength(50).HasDefaultValue("USA");
            entity.Property(e => e.Territory).HasColumnName("territory").HasMaxLength(50);
            entity.Property(e => e.FranchiseId).HasColumnName("franchise_id");
            entity.Property(e => e.CommissionRate).HasColumnName("commission_rate").HasPrecision(5, 2).HasDefaultValue(10.00m);
            entity.Property(e => e.Status).HasColumnName("status").IsRequired().HasMaxLength(20).HasDefaultValue("Active");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.HasOne(e => e.User).WithOne(u => u.Dealer).HasForeignKey<Dealer>(e => e.UserId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Franchise).WithMany(f => f.Dealers).HasForeignKey(e => e.FranchiseId);
        });

        // DealerKyc configuration
        modelBuilder.Entity<DealerKyc>(entity =>
        {
            entity.ToTable("dealer_kyc");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.DealerId).HasColumnName("dealer_id").IsRequired();
            entity.Property(e => e.DocumentType).HasColumnName("document_type").IsRequired().HasMaxLength(50);
            entity.Property(e => e.DocumentNumber).HasColumnName("document_number").IsRequired().HasMaxLength(100);
            entity.Property(e => e.DocumentUrl).HasColumnName("document_url");
            entity.Property(e => e.VerificationStatus).HasColumnName("verification_status").IsRequired()
                .HasConversion<string>()
                .HasMaxLength(20).HasDefaultValue(KycStatus.PENDING);
            entity.Property(e => e.VerifiedBy).HasColumnName("verified_by");
            entity.Property(e => e.VerifiedAt).HasColumnName("verified_at");
            entity.Property(e => e.ExpiryDate).HasColumnName("expiry_date");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.HasOne(e => e.Dealer).WithMany(d => d.KycDocuments).HasForeignKey(e => e.DealerId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.VerifiedByUser).WithMany(u => u.VerifiedKycDocuments).HasForeignKey(e => e.VerifiedBy);
        });

        // Product configuration
        modelBuilder.Entity<Product>(entity =>
        {
            entity.ToTable("products");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Sku).HasColumnName("sku").IsRequired().HasMaxLength(50);
            entity.Property(e => e.Name).HasColumnName("name").IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Category).HasColumnName("category").IsRequired().HasMaxLength(50);
            entity.Property(e => e.Brand).HasColumnName("brand").HasMaxLength(50);
            entity.Property(e => e.UnitPrice).HasColumnName("unit_price").HasPrecision(10, 2).IsRequired();
            entity.Property(e => e.CostPrice).HasColumnName("cost_price").HasPrecision(10, 2).IsRequired();
            entity.Property(e => e.Weight).HasColumnName("weight").HasPrecision(8, 2);
            entity.Property(e => e.Dimensions).HasColumnName("dimensions").HasMaxLength(50);
            entity.Property(e => e.StockQuantity).HasColumnName("stock_quantity").IsRequired().HasDefaultValue(0);
            entity.Property(e => e.MinStockLevel).HasColumnName("min_stock_level").HasDefaultValue(10);
            entity.Property(e => e.IsActive).HasColumnName("is_active").IsRequired().HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.HasIndex(e => e.Sku).IsUnique();
        });

        // Sale configuration
        modelBuilder.Entity<Sale>(entity =>
        {
            entity.ToTable("sales");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.SaleNumber).HasColumnName("sale_number").IsRequired().HasMaxLength(50);
            entity.Property(e => e.DealerId).HasColumnName("dealer_id").IsRequired();
            entity.Property(e => e.CustomerName).HasColumnName("customer_name").HasMaxLength(100);
            entity.Property(e => e.CustomerEmail).HasColumnName("customer_email").HasMaxLength(100);
            entity.Property(e => e.CustomerPhone).HasColumnName("customer_phone").HasMaxLength(20);
            entity.Property(e => e.SaleDate).HasColumnName("sale_date").IsRequired();
            entity.Property(e => e.Subtotal).HasColumnName("subtotal").HasPrecision(12, 2).IsRequired();
            entity.Property(e => e.TaxAmount).HasColumnName("tax_amount").HasPrecision(12, 2).HasDefaultValue(0);
            entity.Property(e => e.DiscountAmount).HasColumnName("discount_amount").HasPrecision(12, 2).HasDefaultValue(0);
            entity.Property(e => e.TotalAmount).HasColumnName("total_amount").HasPrecision(12, 2).IsRequired();
            entity.Property(e => e.PaymentMethod).HasColumnName("payment_method").HasMaxLength(50);
            entity.Property(e => e.PaymentStatus).HasColumnName("payment_status").IsRequired().HasMaxLength(20).HasDefaultValue("Pending");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.HasIndex(e => e.SaleNumber).IsUnique();
            entity.HasOne(e => e.Dealer).WithMany(d => d.Sales).HasForeignKey(e => e.DealerId);
        });

        // SaleItem configuration
        modelBuilder.Entity<SaleItem>(entity =>
        {
            entity.ToTable("sale_items");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.SaleId).HasColumnName("sale_id").IsRequired();
            entity.Property(e => e.ProductId).HasColumnName("product_id").IsRequired();
            entity.Property(e => e.Quantity).HasColumnName("quantity").IsRequired();
            entity.Property(e => e.UnitPrice).HasColumnName("unit_price").HasPrecision(10, 2).IsRequired();
            entity.Property(e => e.DiscountAmount).HasColumnName("discount_amount").HasPrecision(10, 2).HasDefaultValue(0);
            entity.Property(e => e.LineTotal).HasColumnName("line_total").HasPrecision(12, 2).IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.HasOne(e => e.Sale).WithMany(s => s.SaleItems).HasForeignKey(e => e.SaleId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Product).WithMany(p => p.SaleItems).HasForeignKey(e => e.ProductId);
        });

        // Invoice configuration
        modelBuilder.Entity<Invoice>(entity =>
        {
            entity.ToTable("invoices");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.InvoiceNumber).HasColumnName("invoice_number").IsRequired().HasMaxLength(50);
            entity.Property(e => e.SaleId).HasColumnName("sale_id").IsRequired();
            entity.Property(e => e.DealerId).HasColumnName("dealer_id").IsRequired();
            entity.Property(e => e.InvoiceDate).HasColumnName("invoice_date").IsRequired();
            entity.Property(e => e.DueDate).HasColumnName("due_date").IsRequired();
            entity.Property(e => e.Subtotal).HasColumnName("subtotal").HasPrecision(12, 2).IsRequired();
            entity.Property(e => e.TaxAmount).HasColumnName("tax_amount").HasPrecision(12, 2).IsRequired();
            entity.Property(e => e.TotalAmount).HasColumnName("total_amount").HasPrecision(12, 2).IsRequired();
            entity.Property(e => e.PaidAmount).HasColumnName("paid_amount").HasPrecision(12, 2).HasDefaultValue(0);
            entity.Property(e => e.BalanceAmount).HasColumnName("balance_amount").HasPrecision(12, 2).IsRequired();
            entity.Property(e => e.Status).HasColumnName("status").IsRequired().HasMaxLength(20).HasDefaultValue("Pending");
            entity.Property(e => e.PaymentTerms).HasColumnName("payment_terms").HasMaxLength(100);
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.HasIndex(e => e.InvoiceNumber).IsUnique();
            entity.HasOne(e => e.Sale).WithMany(s => s.Invoices).HasForeignKey(e => e.SaleId);
            entity.HasIndex(e => new { e.DealerId, e.InvoiceDate }).HasDatabaseName("idx_invoices_dealer_date");
            entity.HasOne(e => e.Dealer).WithMany(d => d.Invoices).HasForeignKey(e => e.DealerId);
        });

        // Commission configuration
        modelBuilder.Entity<Commission>(entity =>
        {
            entity.ToTable("commissions");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.DealerId).HasColumnName("dealer_id").IsRequired();
            entity.Property(e => e.SaleId).HasColumnName("sale_id").IsRequired();
            entity.Property(e => e.InvoiceId).HasColumnName("invoice_id");
            entity.Property(e => e.CommissionRate).HasColumnName("commission_rate").HasPrecision(5, 2).IsRequired();
            entity.Property(e => e.SaleAmount).HasColumnName("sale_amount").HasPrecision(12, 2).IsRequired();
            entity.Property(e => e.CommissionAmount).HasColumnName("commission_amount").HasPrecision(12, 2).IsRequired();
            entity.Property(e => e.CommissionDate).HasColumnName("commission_date").IsRequired();
            entity.Property(e => e.PaymentStatus).HasColumnName("payment_status").IsRequired().HasMaxLength(20).HasDefaultValue("Pending");
            entity.Property(e => e.PaidDate).HasColumnName("paid_date");
            entity.Property(e => e.PaymentReference).HasColumnName("payment_reference").HasMaxLength(100);
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.HasOne(e => e.Dealer).WithMany(d => d.Commissions).HasForeignKey(e => e.DealerId);
            entity.HasOne(e => e.Sale).WithMany(s => s.Commissions).HasForeignKey(e => e.SaleId);
            entity.HasIndex(e => new { e.DealerId, e.CommissionDate }).HasDatabaseName("idx_commissions_dealer_date");
            entity.HasOne(e => e.Invoice).WithMany(i => i.Commissions).HasForeignKey(e => e.InvoiceId);
        });

        // Franchise configuration
        modelBuilder.Entity<Franchise>(entity =>
        {
            entity.ToTable("franchises");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.FranchiseName).HasColumnName("franchise_name").IsRequired().HasMaxLength(100);
            entity.Property(e => e.FranchiseCode).HasColumnName("franchise_code").IsRequired().HasMaxLength(20);
            entity.Property(e => e.OwnerId).HasColumnName("owner_id").IsRequired();
            entity.Property(e => e.Territory).HasColumnName("territory").IsRequired().HasMaxLength(100);
            entity.Property(e => e.Address).HasColumnName("address").IsRequired();
            entity.Property(e => e.City).HasColumnName("city").IsRequired().HasMaxLength(50);
            entity.Property(e => e.State).HasColumnName("state").IsRequired().HasMaxLength(50);
            entity.Property(e => e.PostalCode).HasColumnName("postal_code").IsRequired().HasMaxLength(20);
            entity.Property(e => e.Country).HasColumnName("country").IsRequired().HasMaxLength(50).HasDefaultValue("USA");
            entity.Property(e => e.FranchiseFee).HasColumnName("franchise_fee").HasPrecision(12, 2).IsRequired();
            entity.Property(e => e.RoyaltyRate).HasColumnName("royalty_rate").HasPrecision(5, 2).HasDefaultValue(5.00m);
            entity.Property(e => e.ContractStartDate).HasColumnName("contract_start_date").IsRequired();
            entity.Property(e => e.ContractEndDate).HasColumnName("contract_end_date").IsRequired();
            entity.Property(e => e.Status).HasColumnName("status").IsRequired().HasMaxLength(20).HasDefaultValue("Active");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.HasIndex(e => e.FranchiseCode).IsUnique();
            entity.HasOne(e => e.Owner).WithMany().HasForeignKey(e => e.OwnerId);
        });

        // RefreshToken configuration
        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.ToTable("refresh_tokens");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
            entity.Property(e => e.Token).HasColumnName("token").IsRequired().HasMaxLength(255);
            entity.Property(e => e.ExpiryDate).HasColumnName("expiry_date").IsRequired();
            entity.Property(e => e.IsRevoked).HasColumnName("is_revoked").HasDefaultValue(false);
            entity.Property(e => e.ReplacedByToken).HasColumnName("replaced_by_token").HasMaxLength(255);
            entity.Property(e => e.RevokedAt).HasColumnName("revoked_at");
            entity.Property(e => e.RevokedByIp).HasColumnName("revoked_by_ip").HasMaxLength(50);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.HasOne(e => e.User).WithMany().HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => e.Token).IsUnique();
        });

        // Cart configuration
        modelBuilder.Entity<Cart>(entity =>
        {
            entity.ToTable("carts");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.SessionId).HasColumnName("session_id").HasMaxLength(100);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").IsRequired();
            entity.HasOne(e => e.User).WithMany(u => u.Carts).HasForeignKey(e => e.UserId);
        });

        // CartItem configuration
        modelBuilder.Entity<CartItem>(entity =>
        {
            entity.ToTable("cart_items");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CartId).HasColumnName("cart_id").IsRequired();
            entity.Property(e => e.ProductId).HasColumnName("product_id").IsRequired();
            entity.Property(e => e.Quantity).HasColumnName("quantity").IsRequired();
            entity.Property(e => e.Price).HasColumnName("price").HasPrecision(10, 2).IsRequired();
            entity.HasOne(e => e.Cart).WithMany(c => c.CartItems).HasForeignKey(e => e.CartId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Product).WithMany().HasForeignKey(e => e.ProductId);
        });

        // Order configuration
        modelBuilder.Entity<Order>(entity =>
        {
            entity.ToTable("orders");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.OrderNumber).HasColumnName("order_number").IsRequired().HasMaxLength(50);
            entity.Property(e => e.CustomerId).HasColumnName("customer_id").IsRequired();
            entity.Property(e => e.AssignedDealerId).HasColumnName("assigned_dealer_id");
            entity.Property(e => e.TotalAmount).HasColumnName("total_amount").HasPrecision(12, 2).IsRequired();
            entity.Property(e => e.Status).HasColumnName("status").IsRequired().HasMaxLength(20).HasDefaultValue("Pending");
            entity.Property(e => e.PaymentMethod).HasColumnName("payment_method").IsRequired().HasMaxLength(20).HasDefaultValue("COD");
            entity.Property(e => e.PaymentStatus).HasColumnName("payment_status").IsRequired().HasMaxLength(20).HasDefaultValue("Pending");
            entity.Property(e => e.ShippingAddress).HasColumnName("shipping_address").IsRequired();
            entity.Property(e => e.City).HasColumnName("city").IsRequired().HasMaxLength(50);
            entity.Property(e => e.State).HasColumnName("state").IsRequired().HasMaxLength(50);
            entity.Property(e => e.PinCode).HasColumnName("pin_code").IsRequired().HasMaxLength(10);
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.CustomerPhone).HasColumnName("customer_phone").IsRequired().HasMaxLength(20);
            entity.Property(e => e.OrderDate).HasColumnName("order_date").IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.HasIndex(e => e.OrderNumber).IsUnique();
            entity.HasOne(e => e.Customer).WithMany(u => u.Orders).HasForeignKey(e => e.CustomerId);
            entity.HasOne(e => e.AssignedDealer).WithMany().HasForeignKey(e => e.AssignedDealerId);
        });

        // OrderItem configuration
        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.ToTable("order_items");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.OrderId).HasColumnName("order_id").IsRequired();
            entity.Property(e => e.ProductId).HasColumnName("product_id").IsRequired();
            entity.Property(e => e.Quantity).HasColumnName("quantity").IsRequired();
            entity.Property(e => e.UnitPrice).HasColumnName("unit_price").HasPrecision(10, 2).IsRequired();
            entity.Property(e => e.TotalPrice).HasColumnName("total_price").HasPrecision(12, 2).IsRequired();
            entity.HasOne(e => e.Order).WithMany(o => o.Items).HasForeignKey(e => e.OrderId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Product).WithMany().HasForeignKey(e => e.ProductId);
        });

        // ProductImage configuration
        modelBuilder.Entity<ProductImage>(entity =>
        {
            entity.ToTable("product_images");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ProductId).HasColumnName("product_id").IsRequired();
            entity.Property(e => e.FileName).HasColumnName("file_name").IsRequired().HasMaxLength(255);
            entity.Property(e => e.ImageUrl).HasColumnName("image_url").IsRequired().HasMaxLength(500);
            entity.Property(e => e.PublicId).HasColumnName("public_id").IsRequired().HasMaxLength(255);
            entity.Property(e => e.ContentType).HasColumnName("content_type").IsRequired().HasMaxLength(100);
            entity.Property(e => e.FileSize).HasColumnName("file_size").IsRequired();
            entity.Property(e => e.IsDefault).HasColumnName("is_default").HasDefaultValue(false);
            entity.Property(e => e.DisplayOrder).HasColumnName("display_order").HasDefaultValue(0);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.HasOne(e => e.Product).WithMany(p => p.Images).HasForeignKey(e => e.ProductId).OnDelete(DeleteBehavior.Cascade);
        });

        // PasswordResetOtp configuration
        modelBuilder.Entity<PasswordResetOtp>(entity =>
        {
            entity.ToTable("password_reset_otps");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Identifier).HasColumnName("identifier").IsRequired().HasMaxLength(255);
            entity.Property(e => e.OtpHash).HasColumnName("otp_hash").IsRequired().HasMaxLength(255);
            entity.Property(e => e.ExpiryTime).HasColumnName("expiry_time").IsRequired();
            entity.Property(e => e.AttemptCount).HasColumnName("attempt_count").HasDefaultValue(0);
            entity.Property(e => e.IsUsed).HasColumnName("is_used").HasDefaultValue(false);
            entity.Property(e => e.LastResendTime).HasColumnName("last_resend_time");
            entity.Property(e => e.UserAgent).HasColumnName("user_agent").HasMaxLength(500);
            entity.Property(e => e.IpAddress).HasColumnName("ip_address").HasMaxLength(50);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.HasIndex(e => e.Identifier);
            entity.HasIndex(e => new { e.Identifier, e.IsUsed, e.ExpiryTime });
        });
    }
}