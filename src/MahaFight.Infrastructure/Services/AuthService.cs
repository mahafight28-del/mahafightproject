using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using MahaFight.Application.Interfaces;
using MahaFight.Domain.Entities;
using MahaFight.Infrastructure.Data;

namespace MahaFight.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IJwtService _jwtService;

    public AuthService(ApplicationDbContext context, IJwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    public async Task<(bool Success, User? User, string? Token, string? RefreshToken)> LoginAsync(string email, string password)
    {
        var user = await _context.Users
            .Include(u => u.Dealer)
            .FirstOrDefaultAsync(u => u.Email == email && u.IsActive);

        if (user == null || !VerifyPassword(password, user.PasswordHash))
            return (false, null, null, null);

        var token = _jwtService.GenerateToken(user.Id.ToString(), user.Email, user.Role);
        var refreshToken = await GenerateRefreshTokenAsync(user.Id);
        
        return (true, user, token, refreshToken.Token);
    }

    public async Task<(bool Success, string? Token, string? RefreshToken)> RefreshTokenAsync(string refreshToken)
    {
        var storedToken = await _context.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == refreshToken);

        if (storedToken == null || !storedToken.IsActive)
            return (false, null, null);

        // Revoke old token
        storedToken.IsRevoked = true;
        storedToken.RevokedAt = DateTime.UtcNow;

        // Generate new tokens
        var newToken = _jwtService.GenerateToken(
            storedToken.User.Id.ToString(), 
            storedToken.User.Email, 
            storedToken.User.Role);
        var newRefreshToken = await GenerateRefreshTokenAsync(storedToken.UserId);

        await _context.SaveChangesAsync();
        return (true, newToken, newRefreshToken.Token);
    }

    public async Task<bool> RevokeTokenAsync(string refreshToken)
    {
        var token = await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == refreshToken);

        if (token == null || !token.IsActive)
            return false;

        token.IsRevoked = true;
        token.RevokedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    private async Task<RefreshToken> GenerateRefreshTokenAsync(Guid userId)
    {
        var refreshToken = new RefreshToken
        {
            UserId = userId,
            Token = _jwtService.GenerateRefreshToken(),
            ExpiryDate = DateTime.UtcNow.AddDays(7) // 7 days
        };

        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();
        return refreshToken;
    }

    public async Task<bool> RegisterUserAsync(string email, string password, string firstName, string lastName, string? phone = null, string role = "User")
    {
        if (await _context.Users.AnyAsync(u => u.Email == email))
            return false;

        var user = new User
        {
            Email = email,
            PasswordHash = HashPassword(password),
            FirstName = firstName,
            LastName = lastName,
            Phone = phone,
            Role = role
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ResetPasswordAsync(Guid userId, string newPassword)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return false;

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        user.UpdatedAt = DateTime.UtcNow;
        
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ResetPasswordByEmailAsync(string email, string newPassword)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null) return false;

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        user.UpdatedAt = DateTime.UtcNow;
        
        await _context.SaveChangesAsync();
        return true;
    }

    public string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var salt = Guid.NewGuid().ToString();
        var saltedPassword = password + salt;
        var hash = Convert.ToBase64String(sha256.ComputeHash(Encoding.UTF8.GetBytes(saltedPassword)));
        return $"{salt}:{hash}";
    }

    public bool VerifyPassword(string password, string hash)
    {
        // Check if it's BCrypt hash (starts with $2a$, $2b$, $2x$, or $2y$)
        if (hash.StartsWith("$2"))
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }
        
        // Legacy SHA256 verification
        var parts = hash.Split(':');
        if (parts.Length != 2) return false;

        var salt = parts[0];
        var storedHash = parts[1];

        using var sha256 = SHA256.Create();
        var saltedPassword = password + salt;
        var computedHash = Convert.ToBase64String(sha256.ComputeHash(Encoding.UTF8.GetBytes(saltedPassword)));

        return storedHash == computedHash;
    }
}