using MahaFight.Domain.Entities;

namespace MahaFight.Application.Interfaces;

public interface IEmailService
{
    Task<bool> SendOtpEmailAsync(string email, string otp, OtpPurpose purpose);
}