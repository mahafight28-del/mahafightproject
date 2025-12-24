namespace MahaFight.Domain.Entities;

public class Franchise : BaseEntity
{
    public string FranchiseName { get; set; } = string.Empty;
    public string FranchiseCode { get; set; } = string.Empty;
    public Guid OwnerId { get; set; }
    public string Territory { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string Country { get; set; } = "USA";
    public decimal FranchiseFee { get; set; }
    public decimal RoyaltyRate { get; set; } = 5.00m;
    public DateTime ContractStartDate { get; set; }
    public DateTime ContractEndDate { get; set; }
    public string Status { get; set; } = "Active";
    
    // Navigation properties
    public User Owner { get; set; } = null!;
    public ICollection<Dealer> Dealers { get; set; } = new List<Dealer>();
}