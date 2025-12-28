using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MahaFight.Application.DTOs;
using MahaFight.Application.Interfaces;
using MahaFight.Domain.Entities;
using MahaFight.Domain.Interfaces;

namespace MahaFight.WebApi.Controllers;

[ApiController]
[Route("api/auth")]
[EnableRateLimiting("OtpPolicy")]
public class OtpController : ControllerBase
{
    private readonly IOtpService _otpService;
    private readonly IAuthService _authService;
    private readonly IRepository<User> _userRepository;

    public OtpController(IOtpService otpService, IAuthService authService, IRepository<User> userRepository)
    {
        _otpService = otpService;
        _authService = authService;
        _userRepository = userRepository;
    }

    [HttpPost("send-otp")]
    public async Task<ActionResult<OtpResponse>> SendOtp([FromBody] SendOtpRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
            return BadRequest(new OtpResponse(false, $"Validation failed: {errors}"));
        }

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
        var userAgent = HttpContext.Request.Headers["User-Agent"].ToString();

        var (success, message) = await _otpService.SendOtpAsync(request.Email, request.Purpose, ipAddress, userAgent);
        
        var response = new OtpResponse(success, message);
        return success ? Ok(response) : BadRequest(response);
    }

    [HttpPost("verify-otp")]
    public async Task<ActionResult<OtpResponse>> VerifyOtp([FromBody] VerifyOtpRequest request)
    {
        var (success, message, token) = await _otpService.VerifyOtpAsync(request.Email, request.Otp, request.Purpose);
        
        var response = new OtpResponse(success, message, token);
        return success ? Ok(response) : BadRequest(response);
    }

    [HttpPost("login-with-otp")]
    public async Task<ActionResult<OtpResponse>> LoginWithOtp([FromBody] LoginWithOtpRequest request)
    {
        var (success, message, token) = await _otpService.VerifyOtpAsync(request.Email, request.Otp, OtpPurpose.LOGIN);
        
        if (success && !string.IsNullOrEmpty(token))
        {
            var refreshToken = Guid.NewGuid().ToString();
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(7)
            };
            Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);

            var users = await _userRepository.GetAllAsync();
            var user = users.FirstOrDefault(u => u.Email.ToLower() == request.Email.ToLower());
            
            if (user != null)
            {
                return Ok(new
                {
                    success = true,
                    message = "Login successful",
                    token,
                    expires = DateTime.UtcNow.AddMinutes(15),
                    user = new
                    {
                        user.Id,
                        user.Email,
                        user.FirstName,
                        user.LastName,
                        user.Role
                    }
                });
            }
        }

        var response = new OtpResponse(success, message);
        return success ? Ok(response) : BadRequest(response);
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult<OtpResponse>> ResetPassword([FromBody] ResetPasswordWithOtpRequest request)
    {
        var users = await _userRepository.GetAllAsync();
        var user = users.FirstOrDefault(u => u.Email.ToLower() == request.Email.ToLower());
        
        if (user == null)
        {
            return BadRequest(new OtpResponse(false, "User not found"));
        }

        var resetSuccess = await _authService.ResetPasswordAsync(user.Id, request.NewPassword);
        
        var message = resetSuccess ? "Password reset successfully" : "Failed to reset password";
        var response = new OtpResponse(resetSuccess, message);
        
        return resetSuccess ? Ok(response) : BadRequest(response);
    }
}