namespace MahaFight.Domain.Entities;

public class Product : BaseEntity
{
    public string Sku { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? Brand { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal CostPrice { get; set; }
    public decimal? Weight { get; set; }
    public string? Dimensions { get; set; }
    public int StockQuantity { get; set; } = 0;
    public int MinStockLevel { get; set; } = 10;
    public bool IsActive { get; set; } = true;
    
    // POS Scanning Fields (ADDITIVE)
    public string? Barcode { get; set; }
    public string? QrCode { get; set; }
    
    // Navigation properties
    public ICollection<SaleItem> SaleItems { get; set; } = new List<SaleItem>();
    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
}