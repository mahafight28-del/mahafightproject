using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MahaFight.Application.DTOs;
using MahaFight.Application.Services;

namespace MahaFight.WebApi.Controllers;

[ApiController]
[Route("api/auth/forgot-password")]
[EnableRateLimiting("ForgotPasswordPolicy")]
public class ForgotPasswordController : ControllerBase
{
    private readonly ForgotPasswordService _forgotPasswordService;

    public ForgotPasswordController(ForgotPasswordService forgotPasswordService)
    {
        _forgotPasswordService = forgotPasswordService;
    }

    [HttpPost("send-otp")]
    public async Task<ActionResult<ForgotPasswordResponse>> SendOtp([FromBody] SendOtpRequest request)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
        var userAgent = HttpContext.Request.Headers["User-Agent"].ToString();
        
        var result = await _forgotPasswordService.SendOtpAsync(request, ipAddress, userAgent);
        
        if (result.Success)
            return Ok(result);
        
        return BadRequest(result);
    }

    [HttpPost("verify-otp")]
    public async Task<ActionResult<ForgotPasswordResponse>> VerifyOtp([FromBody] VerifyOtpRequest request)
    {
        var result = await _forgotPasswordService.VerifyOtpAsync(request);
        
        if (result.Success)
            return Ok(result);
        
        return BadRequest(result);
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult<ForgotPasswordResponse>> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var result = await _forgotPasswordService.ResetPasswordAsync(request);
        
        if (result.Success)
            return Ok(result);
        
        return BadRequest(result);
    }
}