using System.Security.Cryptography;
using System.Text;
using MahaFight.Application.Interfaces;
using MahaFight.Domain.Entities;
using MahaFight.Domain.Interfaces;

namespace MahaFight.Application.Services;

public class OtpService : IOtpService
{
    private readonly IRepository<EmailOtp> _emailOtpRepository;
    private readonly IRepository<User> _userRepository;
    private readonly IEmailService _emailService;
    private readonly IJwtService _jwtService;

    public OtpService(
        IRepository<EmailOtp> emailOtpRepository,
        IRepository<User> userRepository,
        IEmailService emailService,
        IJwtService jwtService)
    {
        _emailOtpRepository = emailOtpRepository;
        _userRepository = userRepository;
        _emailService = emailService;
        _jwtService = jwtService;
    }

    public async Task<(bool Success, string Message)> SendOtpAsync(string email, OtpPurpose purpose, string ipAddress, string userAgent)
    {
        if (await IsRateLimitedAsync(email))
        {
            return (false, "Please wait 60 seconds before requesting another OTP");
        }

        var users = await _userRepository.GetAllAsync();
        var user = users.FirstOrDefault(u => u.Email.ToLower() == email.ToLower());
        if (user == null)
        {
            return (false, "Email not found");
        }

        var otp = GenerateOtp();
        var otpHash = HashOtp(otp);

        var emailOtp = new EmailOtp
        {
            Email = email.ToLower(),
            OtpHash = otpHash,
            Purpose = purpose,
            ExpiresAt = DateTime.UtcNow.AddMinutes(5),
            IpAddress = ipAddress,
            UserAgent = userAgent
        };

        await _emailOtpRepository.AddAsync(emailOtp);

        var emailSent = await _emailService.SendOtpEmailAsync(email, otp, purpose);
        if (!emailSent)
        {
            return (false, "Failed to send OTP email");
        }

        return (true, "OTP sent to your email");
    }

    public async Task<(bool Success, string Message, string? Token)> VerifyOtpAsync(string email, string otp, OtpPurpose purpose)
    {
        var otps = await _emailOtpRepository.GetAllAsync();
        var emailOtp = otps
            .Where(o => o.Email.ToLower() == email.ToLower() && 
                       o.Purpose == purpose && 
                       !o.IsUsed && 
                       o.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefault();

        if (emailOtp == null)
        {
            return (false, "Invalid or expired OTP", null);
        }

        emailOtp.AttemptCount++;
        await _emailOtpRepository.UpdateAsync(emailOtp);

        if (emailOtp.AttemptCount > 3)
        {
            emailOtp.IsUsed = true;
            await _emailOtpRepository.UpdateAsync(emailOtp);
            return (false, "Too many attempts. Please request a new OTP", null);
        }

        if (!VerifyOtpHash(otp, emailOtp.OtpHash))
        {
            return (false, "Invalid OTP", null);
        }

        emailOtp.IsUsed = true;
        await _emailOtpRepository.UpdateAsync(emailOtp);

        string? token = null;
        if (purpose == OtpPurpose.LOGIN)
        {
            var users = await _userRepository.GetAllAsync();
            var user = users.FirstOrDefault(u => u.Email.ToLower() == email.ToLower());
            if (user != null)
            {
                token = _jwtService.GenerateToken(user.Id.ToString(), user.Email, user.Role);
            }
        }

        return (true, "OTP verified successfully", token);
    }

    public async Task<bool> IsRateLimitedAsync(string email)
    {
        var otps = await _emailOtpRepository.GetAllAsync();
        var recentOtp = otps
            .Where(o => o.Email.ToLower() == email.ToLower() && 
                       o.CreatedAt > DateTime.UtcNow.AddSeconds(-60))
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefault();

        return recentOtp != null;
    }

    private static string GenerateOtp()
    {
        using var rng = RandomNumberGenerator.Create();
        var bytes = new byte[4];
        rng.GetBytes(bytes);
        var number = BitConverter.ToUInt32(bytes, 0);
        return (number % 900000 + 100000).ToString();
    }

    private static string HashOtp(string otp)
    {
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(otp));
        return Convert.ToBase64String(hashedBytes);
    }

    private static bool VerifyOtpHash(string otp, string hash)
    {
        var otpHash = HashOtp(otp);
        return otpHash == hash;
    }
}