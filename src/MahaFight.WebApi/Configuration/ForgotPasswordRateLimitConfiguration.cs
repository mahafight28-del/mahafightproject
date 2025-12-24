using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

namespace MahaFight.WebApi.Configuration;

public static class ForgotPasswordRateLimitConfiguration
{
    public static void AddForgotPasswordRateLimit(this IServiceCollection services)
    {
        services.AddRateLimiter(options =>
        {
            // Add missing ApiPolicy for existing controllers
            options.AddFixedWindowLimiter("ApiPolicy", limiterOptions =>
            {
                limiterOptions.PermitLimit = 100;
                limiterOptions.Window = TimeSpan.FromMinutes(1);
                limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
                limiterOptions.QueueLimit = 0;
            });

            // Forgot password specific policy
            options.AddFixedWindowLimiter("ForgotPasswordPolicy", limiterOptions =>
            {
                limiterOptions.PermitLimit = 3; // 3 requests
                limiterOptions.Window = TimeSpan.FromMinutes(15); // per 15 minutes
                limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
                limiterOptions.QueueLimit = 0; // No queue
            });

            options.OnRejected = async (context, token) =>
            {
                context.HttpContext.Response.StatusCode = 429;
                await context.HttpContext.Response.WriteAsync("Too many requests. Please try again later.", token);
            };
        });
    }
}