using System.Security.Claims;
using MahaFight.Domain.Entities;
using MahaFight.Domain.Interfaces;

namespace MahaFight.WebApi.Middleware;

public class KycEnforcementMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<KycEnforcementMiddleware> _logger;
    
    private static readonly string[] ProtectedRoutes = {
        "/api/sales",
        "/api/invoices", 
        "/api/commissions"
    };

    public KycEnforcementMiddleware(RequestDelegate next, ILogger<KycEnforcementMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Skip if not a protected route
        if (!IsProtectedRoute(context.Request.Path))
        {
            await _next(context);
            return;
        }

        // Skip if not authenticated
        if (!context.User.Identity?.IsAuthenticated == true)
        {
            await _next(context);
            return;
        }

        var userRole = context.User.FindFirst("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
        
        // Skip if Admin
        if (userRole == "Admin")
        {
            await _next(context);
            return;
        }

        // Enforce KYC for Dealers
        if (userRole == "Dealer")
        {
            var userId = context.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
            
            if (Guid.TryParse(userId, out var dealerUserId))
            {
                var isKycApproved = await CheckKycStatusAsync(context, dealerUserId);
                
                if (!isKycApproved)
                {
                    context.Response.StatusCode = 403;
                    context.Response.ContentType = "application/json";
                    
                    var response = new
                    {
                        error = "KYC_NOT_APPROVED",
                        message = "Your KYC documents are not approved. Please complete KYC verification to access business features.",
                        statusCode = 403
                    };
                    
                    await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(response));
                    return;
                }
            }
        }

        await _next(context);
    }

    private static bool IsProtectedRoute(string path)
    {
        return ProtectedRoutes.Any(route => path.StartsWith(route, StringComparison.OrdinalIgnoreCase));
    }

    private async Task<bool> CheckKycStatusAsync(HttpContext context, Guid userId)
    {
        try
        {
            var dealerRepository = context.RequestServices.GetRequiredService<IRepository<Dealer>>();
            var kycRepository = context.RequestServices.GetRequiredService<IRepository<DealerKyc>>();
            
            var dealers = await dealerRepository.GetAllAsync();
            var dealer = dealers.FirstOrDefault(d => d.UserId == userId);
            
            if (dealer == null) return false;
            
            var kycDocs = await kycRepository.GetAllAsync();
            return kycDocs.Any(k => k.DealerId == dealer.Id && k.VerificationStatus == KycStatus.APPROVED);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking KYC status for user {UserId}", userId);
            return false;
        }
    }
}