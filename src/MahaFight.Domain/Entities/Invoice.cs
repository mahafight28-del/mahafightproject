namespace MahaFight.Domain.Entities;

public class Invoice : BaseEntity
{
    public string InvoiceNumber { get; set; } = string.Empty;
    public Guid SaleId { get; set; }
    public Guid DealerId { get; set; }
    public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;
    public DateTime DueDate { get; set; }
    public decimal Subtotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; } = 0;
    public decimal BalanceAmount { get; set; }
    public string Status { get; set; } = "Pending";
    public string? PaymentTerms { get; set; }
    public string? Notes { get; set; }
    
    // Navigation properties
    public Sale Sale { get; set; } = null!;
    public Dealer Dealer { get; set; } = null!;
    public ICollection<Commission> Commissions { get; set; } = new List<Commission>();
}