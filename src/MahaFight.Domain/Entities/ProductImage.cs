namespace MahaFight.Domain.Entities;

public class ProductImage : BaseEntity
{
    public Guid ProductId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty; // Cloudinary URL
    public string PublicId { get; set; } = string.Empty; // Cloudinary Public ID for deletion
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public bool IsDefault { get; set; } = false;
    public int DisplayOrder { get; set; } = 0;
    
    // Navigation property
    public Product Product { get; set; } = null!;
}