using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Logging;
using MahaFight.Application.DTOs;
using MahaFight.Application.Interfaces;
using MahaFight.Domain.Entities;
using MahaFight.Domain.Interfaces;

namespace MahaFight.Application.Services;

public class ForgotPasswordService
{
    private readonly IRepository<User> _userRepository;
    private readonly IRepository<PasswordResetOtp> _otpRepository;
    private readonly ISmsService _smsService;
    private readonly ILogger<ForgotPasswordService> _logger;
    
    private const int OTP_LENGTH = 6;
    private const int OTP_EXPIRY_MINUTES = 5;
    private const int MAX_ATTEMPTS = 3;
    private const int RESEND_COOLDOWN_SECONDS = 60;

    public ForgotPasswordService(
        IRepository<User> userRepository,
        IRepository<PasswordResetOtp> otpRepository,
        ISmsService smsService,
        ILogger<ForgotPasswordService> logger)
    {
        _userRepository = userRepository;
        _otpRepository = otpRepository;
        _smsService = smsService;
        _logger = logger;
    }

    public async Task<ForgotPasswordResponse> SendOtpAsync(SendOtpRequest request, string ipAddress, string userAgent)
    {
        try
        {
            _logger.LogInformation("Attempting to send OTP for identifier: {Identifier}", MaskIdentifier(request.Identifier));
            
            // Find user by email or phone
            var user = await FindUserByIdentifier(request.Identifier);
            
            // Log all users for debugging
            var allUsers = await _userRepository.GetAllAsync();
            _logger.LogInformation("Total users in database: {Count}", allUsers.Count());
            foreach (var u in allUsers.Take(5)) // Show first 5 users
            {
                _logger.LogInformation("User: Email={Email}, Phone={Phone}, Active={Active}", 
                    u.Email, u.Phone ?? "NULL", u.IsActive);
            }
            
            // Always return success to prevent user enumeration
            if (user == null)
            {
                _logger.LogWarning("Password reset attempted for non-existent identifier: {Identifier}", MaskIdentifier(request.Identifier));
                return new ForgotPasswordResponse(true, "If the account exists, OTP has been sent.");
            }

            // Check resend cooldown
            var identifierHash = HashIdentifier(request.Identifier);
            var existingOtp = await GetActiveOtp(identifierHash);
            
            if (existingOtp?.LastResendTime != null)
            {
                var timeSinceLastResend = DateTime.UtcNow - existingOtp.LastResendTime.Value;
                if (timeSinceLastResend.TotalSeconds < RESEND_COOLDOWN_SECONDS)
                {
                    var remainingSeconds = RESEND_COOLDOWN_SECONDS - (int)timeSinceLastResend.TotalSeconds;
                    return new ForgotPasswordResponse(false, "Please wait before requesting another OTP.", remainingSeconds);
                }
            }

            // Generate and send OTP
            var otp = GenerateOtp();
            var otpHash = HashOtp(otp);

            // Invalidate existing OTPs
            await InvalidateExistingOtps(identifierHash);

            // Create new OTP record
            var otpRecord = new PasswordResetOtp
            {
                Identifier = identifierHash,
                OtpHash = otpHash,
                ExpiryTime = DateTime.UtcNow.AddMinutes(OTP_EXPIRY_MINUTES),
                AttemptCount = 0,
                IsUsed = false,
                LastResendTime = DateTime.UtcNow,
                UserAgent = userAgent,
                IpAddress = ipAddress
            };

            await _otpRepository.AddAsync(otpRecord);

            // Send OTP via SMS (only if phone number) or log for email
            if (IsPhoneNumber(request.Identifier))
            {
                await _smsService.SendOtpAsync(request.Identifier, otp);
            }
            else
            {
                // For email, also log OTP in console for development
                _logger.LogInformation("📧 EMAIL OTP for {Email}: {OTP}", request.Identifier, otp);
                Console.WriteLine($"📧 EMAIL OTP for {request.Identifier}: {otp}");
            }

            _logger.LogInformation("Password reset OTP sent for user: {UserId}", user.Id);
            return new ForgotPasswordResponse(true, "OTP has been sent to your registered mobile number.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending password reset OTP");
            return new ForgotPasswordResponse(false, "Unable to send OTP. Please try again later.");
        }
    }

    public async Task<ForgotPasswordResponse> VerifyOtpAsync(VerifyOtpRequest request)
    {
        try
        {
            _logger.LogInformation("Verifying OTP for identifier: {Identifier}", MaskIdentifier(request.Identifier));
            
            var identifierHash = HashIdentifier(request.Identifier);
            _logger.LogInformation("Looking for OTP with hash: {Hash}", identifierHash.Substring(0, 10) + "...");
            
            var otpRecord = await GetActiveOtp(identifierHash);

            if (otpRecord == null)
            {
                _logger.LogWarning("No active OTP found for identifier: {Identifier}", MaskIdentifier(request.Identifier));
                return new ForgotPasswordResponse(false, "Invalid or expired OTP.");
            }
            
            if (otpRecord.IsUsed)
            {
                _logger.LogWarning("OTP already used for identifier: {Identifier}", MaskIdentifier(request.Identifier));
                return new ForgotPasswordResponse(false, "Invalid or expired OTP.");
            }
            
            if (DateTime.UtcNow > otpRecord.ExpiryTime)
            {
                _logger.LogWarning("OTP expired for identifier: {Identifier}", MaskIdentifier(request.Identifier));
                return new ForgotPasswordResponse(false, "Invalid or expired OTP.");
            }

            if (otpRecord.AttemptCount >= MAX_ATTEMPTS)
            {
                await InvalidateOtp(otpRecord);
                _logger.LogWarning("Max attempts exceeded for identifier: {Identifier}", MaskIdentifier(request.Identifier));
                return new ForgotPasswordResponse(false, "Maximum attempts exceeded. Please request a new OTP.");
            }

            // Verify OTP
            var otpHash = HashOtp(request.Otp);
            _logger.LogInformation("Comparing OTP hashes - Stored: {Stored}, Provided: {Provided}", 
                otpRecord.OtpHash.Substring(0, 10) + "...", otpHash.Substring(0, 10) + "...");
                
            if (otpRecord.OtpHash != otpHash)
            {
                otpRecord.AttemptCount++;
                await _otpRepository.UpdateAsync(otpRecord);
                
                var remainingAttempts = MAX_ATTEMPTS - otpRecord.AttemptCount;
                _logger.LogWarning("Invalid OTP for identifier: {Identifier}, attempts: {Attempts}", 
                    MaskIdentifier(request.Identifier), otpRecord.AttemptCount);
                return new ForgotPasswordResponse(false, $"Invalid OTP. {remainingAttempts} attempts remaining.");
            }

            // OTP verified successfully - DON'T mark as used yet for reset password
            _logger.LogInformation("OTP verified successfully for identifier: {Identifier}", MaskIdentifier(request.Identifier));
            return new ForgotPasswordResponse(true, "OTP verified successfully. You can now reset your password.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying OTP for identifier: {Identifier}", MaskIdentifier(request.Identifier));
            return new ForgotPasswordResponse(false, "Unable to verify OTP. Please try again.");
        }
    }

    public async Task<ForgotPasswordResponse> ResetPasswordAsync(ResetPasswordRequest request)
    {
        try
        {
            _logger.LogInformation("Resetting password for identifier: {Identifier}", MaskIdentifier(request.Identifier));
            
            // Verify OTP again and mark as used
            var identifierHash = HashIdentifier(request.Identifier);
            var otpRecord = await GetActiveOtp(identifierHash);
            
            if (otpRecord == null || otpRecord.IsUsed || DateTime.UtcNow > otpRecord.ExpiryTime)
            {
                return new ForgotPasswordResponse(false, "Invalid or expired OTP.");
            }
            
            var otpHash = HashOtp(request.Otp);
            if (otpRecord.OtpHash != otpHash)
            {
                return new ForgotPasswordResponse(false, "Invalid OTP.");
            }
            
            // Mark OTP as used
            otpRecord.IsUsed = true;
            await _otpRepository.UpdateAsync(otpRecord);

            // Find user and update password
            var user = await FindUserByIdentifier(request.Identifier);
            if (user == null)
            {
                return new ForgotPasswordResponse(false, "User not found.");
            }

            // Hash new password
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;
            
            await _userRepository.UpdateAsync(user);

            _logger.LogInformation("Password reset completed for user: {UserId}", user.Id);
            return new ForgotPasswordResponse(true, "Password reset successfully. You can now login with your new password.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting password for identifier: {Identifier}", MaskIdentifier(request.Identifier));
            return new ForgotPasswordResponse(false, "Unable to reset password. Please try again.");
        }
    }

    private async Task<User?> FindUserByIdentifier(string identifier)
    {
        var users = await _userRepository.GetAllAsync();
        
        if (IsPhoneNumber(identifier))
        {
            return users.FirstOrDefault(u => u.Phone == identifier && u.IsActive);
        }
        else
        {
            return users.FirstOrDefault(u => u.Email.ToLower() == identifier.ToLower() && u.IsActive);
        }
    }

    private async Task<PasswordResetOtp?> GetActiveOtp(string identifierHash)
    {
        var otps = await _otpRepository.GetAllAsync();
        return otps.FirstOrDefault(o => o.Identifier == identifierHash && !o.IsUsed && DateTime.UtcNow <= o.ExpiryTime);
    }

    private async Task InvalidateExistingOtps(string identifierHash)
    {
        var otps = await _otpRepository.GetAllAsync();
        var activeOtps = otps.Where(o => o.Identifier == identifierHash && !o.IsUsed);
        
        foreach (var otp in activeOtps)
        {
            otp.IsUsed = true;
            await _otpRepository.UpdateAsync(otp);
        }
    }

    private async Task InvalidateOtp(PasswordResetOtp otp)
    {
        otp.IsUsed = true;
        await _otpRepository.UpdateAsync(otp);
    }

    private string GenerateOtp()
    {
        var random = new Random();
        return random.Next(100000, 999999).ToString();
    }

    private string HashOtp(string otp)
    {
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(otp));
        return Convert.ToBase64String(hashedBytes);
    }

    private string HashIdentifier(string identifier)
    {
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(identifier.ToLower()));
        return Convert.ToBase64String(hashedBytes);
    }

    private bool IsPhoneNumber(string identifier) => 
        identifier.All(char.IsDigit) && identifier.Length == 10;

    private string MaskIdentifier(string identifier)
    {
        if (IsPhoneNumber(identifier))
        {
            return $"***{identifier.Substring(identifier.Length - 3)}";
        }
        else
        {
            var parts = identifier.Split('@');
            if (parts.Length == 2)
            {
                return $"{parts[0].Substring(0, Math.Min(2, parts[0].Length))}***@{parts[1]}";
            }
        }
        return "***";
    }
}