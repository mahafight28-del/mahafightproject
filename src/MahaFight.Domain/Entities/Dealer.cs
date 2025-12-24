namespace MahaFight.Domain.Entities;

public class Dealer : BaseEntity
{
    public Guid UserId { get; set; }
    public string BusinessName { get; set; } = string.Empty;
    public string BusinessType { get; set; } = string.Empty;
    public string? RegistrationNumber { get; set; }
    public string? TaxId { get; set; }
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string Country { get; set; } = "USA";
    public string? Territory { get; set; }
    public Guid? FranchiseId { get; set; }
    public decimal CommissionRate { get; set; } = 10.00m;
    public string Status { get; set; } = "Active";
    
    // Navigation properties
    public User User { get; set; } = null!;
    public Franchise? Franchise { get; set; }
    public ICollection<DealerKyc> KycDocuments { get; set; } = new List<DealerKyc>();
    public ICollection<Sale> Sales { get; set; } = new List<Sale>();
    public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
    public ICollection<Commission> Commissions { get; set; } = new List<Commission>();
}