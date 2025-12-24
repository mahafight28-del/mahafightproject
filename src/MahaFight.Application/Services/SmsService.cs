using MahaFight.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace MahaFight.Application.Services;

public class SmsService : ISmsService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<SmsService> _logger;
    private readonly bool _isDevelopment;

    public SmsService(IConfiguration configuration, ILogger<SmsService> logger)
    {
        _configuration = configuration;
        _logger = logger;
        // Always show OTP in console for development
        _isDevelopment = true; // Force development mode for OTP display
    }

    public async Task<bool> SendOtpAsync(string phoneNumber, string otp)
    {
        var message = $"Your MAHA FIGHT password reset OTP is: {otp}. Valid for 5 minutes. Do not share.";
        return await SendMessageAsync(phoneNumber, message);
    }

    public async Task<bool> SendMessageAsync(string phoneNumber, string message)
    {
        try
        {
            if (_isDevelopment)
            {
                // Development: Log to console
                _logger.LogInformation("SMS to {Phone}: {Message}", phoneNumber, message);
                Console.WriteLine($"📱 SMS to {phoneNumber}: {message}");
                return true;
            }

            // Production: Use actual SMS provider
            return await SendViaSmsProvider(phoneNumber, message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send SMS to {Phone}", phoneNumber);
            return false;
        }
    }

    private Task<bool> SendViaSmsProvider(string phoneNumber, string message)
    {
        // TODO: Implement Fast2SMS or TextBelt for production
        // For now, log and return true
        _logger.LogWarning("SMS provider not configured. Message: {Message}", message);
        return Task.FromResult(true);
    }
}