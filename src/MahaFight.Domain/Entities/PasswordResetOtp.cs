namespace MahaFight.Domain.Entities;

public class PasswordResetOtp : BaseEntity
{
    public string Identifier { get; set; } = string.Empty; // Email or Phone (hashed)
    public string OtpHash { get; set; } = string.Empty; // Hashed OTP
    public DateTime ExpiryTime { get; set; }
    public int AttemptCount { get; set; } = 0;
    public bool IsUsed { get; set; } = false;
    public DateTime? LastResendTime { get; set; }
    public string? UserAgent { get; set; }
    public string? IpAddress { get; set; }
}