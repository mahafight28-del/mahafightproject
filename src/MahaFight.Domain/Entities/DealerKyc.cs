namespace MahaFight.Domain.Entities;

public class DealerKyc : BaseEntity
{
    public Guid DealerId { get; set; }
    public string DocumentType { get; set; } = string.Empty;
    public string DocumentNumber { get; set; } = string.Empty;
    public string? DocumentUrl { get; set; }
    public KycStatus VerificationStatus { get; set; } = KycStatus.PENDING;
    public Guid? VerifiedBy { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? Notes { get; set; }
    
    // Navigation properties
    public Dealer Dealer { get; set; } = null!;
    public User? VerifiedByUser { get; set; }
}