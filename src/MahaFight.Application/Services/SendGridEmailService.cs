using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MahaFight.Application.Interfaces;
using MahaFight.Domain.Entities;

namespace MahaFight.Application.Services;

public class SendGridEmailService : IEmailService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<SendGridEmailService> _logger;

    public SendGridEmailService(HttpClient httpClient, IConfiguration configuration, ILogger<SendGridEmailService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<bool> SendOtpEmailAsync(string email, string otp, OtpPurpose purpose)
    {
        try
        {
            var apiKey = _configuration["SendGrid:ApiKey"];
            if (string.IsNullOrEmpty(apiKey))
            {
                _logger.LogError("SendGrid API key not configured");
                return false;
            }

            var subject = purpose == OtpPurpose.LOGIN ? "Login OTP - MAHA FIGHT" : "Password Reset OTP - MAHA FIGHT";
            var htmlContent = GetEmailTemplate(otp, purpose);

            var payload = new
            {
                personalizations = new[]
                {
                    new
                    {
                        to = new[] { new { email = email } },
                        subject = subject
                    }
                },
                from = new { email = "mahafight28@gmail.com", name = "MAHA FIGHT" },
                content = new[]
                {
                    new
                    {
                        type = "text/html",
                        value = htmlContent
                    }
                }
            };

            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");
            _httpClient.Timeout = TimeSpan.FromSeconds(10);

            var response = await _httpClient.PostAsync("https://api.sendgrid.com/v3/mail/send", content);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Email sent successfully via SendGrid to {Email}", email);
                return true;
            }

            var errorContent = await response.Content.ReadAsStringAsync();
            _logger.LogError("SendGrid failed: {StatusCode} - {Content}", response.StatusCode, errorContent);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SendGrid email send failed for {Email}", email);
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