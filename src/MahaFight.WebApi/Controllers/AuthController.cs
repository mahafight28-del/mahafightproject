using Microsoft.AspNetCore.Mvc;
using MahaFight.Application.Interfaces;

namespace MahaFight.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<object>> Login([FromBody] LoginRequest request)
    {
        var (success, user, token, refreshToken) = await _authService.LoginAsync(request.Email, request.Password);
        
        if (!success)
            return Unauthorized("Invalid credentials");

        // Set refresh token as httpOnly cookie
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(7)
        };
        Response.Cookies.Append("refreshToken", refreshToken!, cookieOptions);

        return Ok(new 
        { 
            token, 
            expires = DateTime.UtcNow.AddMinutes(15),
            user = new
            {
                user!.Id,
                user.Email,
                user.FirstName,
                user.LastName,
                user.Role
            }
        });
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<object>> RefreshToken()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (string.IsNullOrEmpty(refreshToken))
            return Unauthorized("Refresh token not found");

        var (success, newToken, newRefreshToken) = await _authService.RefreshTokenAsync(refreshToken);
        
        if (!success)
            return Unauthorized("Invalid refresh token");

        // Update refresh token cookie
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(7)
        };
        Response.Cookies.Append("refreshToken", newRefreshToken!, cookieOptions);

        return Ok(new 
        { 
            token = newToken, 
            expires = DateTime.UtcNow.AddMinutes(15)
        });
    }

    [HttpPost("logout")]
    public async Task<ActionResult> Logout()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (!string.IsNullOrEmpty(refreshToken))
        {
            await _authService.RevokeTokenAsync(refreshToken);
        }

        Response.Cookies.Delete("refreshToken");
        return Ok("Logged out successfully");
    }

    [HttpPost("register")]
    public async Task<ActionResult> Register([FromBody] RegisterRequest request)
    {
        var success = await _authService.RegisterUserAsync(
            request.Email, 
            request.Password, 
            request.FirstName, 
            request.LastName, 
            request.Role ?? "User");

        if (!success)
            return BadRequest("User already exists");

        return Ok("User registered successfully");
    }

    [HttpPost("register-customer")]
    public async Task<ActionResult> RegisterCustomer([FromBody] CustomerRegisterRequest request)
    {
        var success = await _authService.RegisterUserAsync(
            request.Email,
            request.Password,
            request.Name,
            "",
            request.Phone,
            "Customer");

        if (!success)
            return BadRequest("Customer already exists");

        return Ok("Customer registered successfully");
    }
}

public record LoginRequest(string Email, string Password);
public record RegisterRequest(string Email, string Password, string FirstName, string LastName, string? Role);
public record CustomerRegisterRequest(string Name, string Email, string Phone, string Password);