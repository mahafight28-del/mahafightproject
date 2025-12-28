using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MahaFight.Application.DTOs;
using MahaFight.Application.Interfaces;
using MahaFight.Domain.Entities;

namespace MahaFight.WebApi.Controllers;

[ApiController]
[Route("api/auth/forgot-password")]
[EnableRateLimiting("ForgotPasswordPolicy")]
public class ForgotPasswordController : ControllerBase
{
    private readonly IOtpService _otpService;
    private readonly IAuthService _authService;

    public ForgotPasswordController(IOtpService otpService, IAuthService authService)
    {
        _otpService = otpService;
        _authService = authService;
    }

    [HttpPost("send-otp")]
    public async Task<ActionResult<ForgotPasswordResponse>> SendOtp([FromBody] SendOtpRequest request)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
        var userAgent = HttpContext.Request.Headers["User-Agent"].ToString();
        
        var (success, message) = await _otpService.SendOtpAsync(request.Email, OtpPurpose.RESET_PASSWORD, ipAddress, userAgent);
        
        var result = new ForgotPasswordResponse(success, message);
        return success ? Ok(result) : BadRequest(result);
    }

    [HttpPost("verify-otp")]
    public async Task<ActionResult<ForgotPasswordResponse>> VerifyOtp([FromBody] VerifyOtpRequest request)
    {
        var (success, message, _) = await _otpService.VerifyOtpAsync(request.Email, request.Otp, OtpPurpose.RESET_PASSWORD);
        
        var result = new ForgotPasswordResponse(success, message);
        return success ? Ok(result) : BadRequest(result);
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult<ForgotPasswordResponse>> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        // Verify OTP first
        var (otpValid, otpMessage, _) = await _otpService.VerifyOtpAsync(request.Identifier, request.Otp, OtpPurpose.RESET_PASSWORD);
        
        if (!otpValid)
        {
            return BadRequest(new ForgotPasswordResponse(false, otpMessage));
        }

        // Reset password using auth service
        var resetSuccess = await _authService.ResetPasswordByEmailAsync(request.Identifier, request.NewPassword);
        
        var message = resetSuccess ? "Password reset successfully" : "Failed to reset password";
        var result = new ForgotPasswordResponse(resetSuccess, message);
        
        return resetSuccess ? Ok(result) : BadRequest(result);
    }
}