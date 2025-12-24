namespace MahaFight.Domain.Entities;

public class Commission : BaseEntity
{
    public Guid DealerId { get; set; }
    public Guid SaleId { get; set; }
    public Guid? InvoiceId { get; set; }
    public decimal CommissionRate { get; set; }
    public decimal SaleAmount { get; set; }
    public decimal CommissionAmount { get; set; }
    public DateTime CommissionDate { get; set; } = DateTime.UtcNow;
    public string PaymentStatus { get; set; } = "Pending";
    public DateTime? PaidDate { get; set; }
    public string? PaymentReference { get; set; }
    public string? Notes { get; set; }
    
    // Navigation properties
    public Dealer Dealer { get; set; } = null!;
    public Sale Sale { get; set; } = null!;
    public Invoice? Invoice { get; set; }
}