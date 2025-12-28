using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MahaFight.Application.Interfaces;
using MahaFight.Domain.Entities;

namespace MahaFight.Application.Services;

public class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(IConfiguration configuration, ILogger<SmtpEmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<bool> SendOtpEmailAsync(string email, string otp, OtpPurpose purpose)
    {
        try
        {
            var smtpHost = _configuration["Smtp:Host"];
            var smtpPort = int.Parse(_configuration["Smtp:Port"] ?? "587");
            var smtpUsername = _configuration["Smtp:Username"];
            var smtpPassword = _configuration["Smtp:Password"];

            if (string.IsNullOrEmpty(smtpHost) || string.IsNullOrEmpty(smtpUsername) || string.IsNullOrEmpty(smtpPassword))
            {
                _logger.LogError("SMTP configuration missing");
                return false;
            }

            var subject = purpose == OtpPurpose.LOGIN ? "Login OTP - MAHA FIGHT" : "Password Reset OTP - MAHA FIGHT";
            var body = GetEmailTemplate(otp, purpose);

            using var client = new SmtpClient(smtpHost, smtpPort)
            {
                Credentials = new NetworkCredential(smtpUsername, smtpPassword),
                EnableSsl = true
            };

            var message = new MailMessage(smtpUsername, email, subject, body)
            {
                IsBodyHtml = true
            };

            await client.SendMailAsync(message);
            _logger.LogInformation("Email sent successfully via SMTP to {Email}", email);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SMTP email send failed for {Email}", email);
            return false;
        }
    }

    private static string GetEmailTemplate(string otp, OtpPurpose purpose)
    {
        var action = purpose == OtpPurpose.LOGIN ? "login to your account" : "reset your password";
        
        return $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        .container {{ max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }}
        .header {{ background: #1890ff; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 30px; background: #f9f9f9; }}
        .otp {{ font-size: 32px; font-weight: bold; color: #1890ff; text-align: center; margin: 20px 0; letter-spacing: 5px; }}
        .footer {{ padding: 20px; text-align: center; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>MAHA FIGHT</h1>
        </div>
        <div class='content'>
            <h2>Your OTP Code</h2>
            <p>Use this code to {action}:</p>
            <div class='otp'>{otp}</div>
            <p><strong>This code expires in 5 minutes.</strong></p>
            <p>If you didn't request this, please ignore this email.</p>
        </div>
        <div class='footer'>
            <p>© 2025 MAHA FIGHT. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";
    }
}