using MahaFight.Domain.Entities;

namespace MahaFight.Application.Interfaces;

public interface IOtpService
{
    Task<(bool Success, string Message)> SendOtpAsync(string email, OtpPurpose purpose, string ipAddress, string userAgent);
    Task<(bool Success, string Message, string? Token)> VerifyOtpAsync(string email, string otp, OtpPurpose purpose);
    Task<bool> IsRateLimitedAsync(string email);
}