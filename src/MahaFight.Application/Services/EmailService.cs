using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using MahaFight.Application.Interfaces;
using MahaFight.Domain.Entities;

namespace MahaFight.Application.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<bool> SendOtpEmailAsync(string email, string otp, OtpPurpose purpose)
    {
        try
        {
            var smtpHost = _configuration["Email:SmtpHost"] ?? "smtp.gmail.com";
            var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
            var fromEmail = _configuration["Email:FromEmail"] ?? throw new InvalidOperationException("Email:FromEmail not configured");
            var fromPassword = _configuration["Email:FromPassword"] ?? throw new InvalidOperationException("Email:FromPassword not configured");
            var fromName = _configuration["Email:FromName"] ?? "MAHA FIGHT";

            using var client = new SmtpClient(smtpHost, smtpPort)
            {
                EnableSsl = true,
                Credentials = new NetworkCredential(fromEmail, fromPassword)
            };

            var subject = purpose == OtpPurpose.LOGIN ? "Login OTP - MAHA FIGHT" : "Password Reset OTP - MAHA FIGHT";
            var body = GetEmailTemplate(otp, purpose);

            var message = new MailMessage(new MailAddress(fromEmail, fromName), new MailAddress(email))
            {
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };

            await client.SendMailAsync(message);
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Email send failed: {ex.Message}");
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