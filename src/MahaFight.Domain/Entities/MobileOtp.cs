namespace MahaFight.Domain.Entities;

public class MobileOtp : BaseEntity
{
    public string Phone { get; set; } = string.Empty;
    public string OtpHash { get; set; } = string.Empty;
    public OtpPurpose Purpose { get; set; }
    public DateTime ExpiresAt { get; set; }
    public bool IsUsed { get; set; } = false;
    public int AttemptCount { get; set; } = 0;
    public string? UserAgent { get; set; }
    public string? IpAddress { get; set; }
}