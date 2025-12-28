using MahaFight.Domain.Entities;

namespace MahaFight.Application.Interfaces;

public interface IAuthService
{
    Task<(bool Success, User? User, string? Token, string? RefreshToken)> LoginAsync(string email, string password);
    Task<(bool Success, string? Token, string? RefreshToken)> RefreshTokenAsync(string refreshToken);
    Task<bool> RevokeTokenAsync(string refreshToken);
    Task<bool> RegisterUserAsync(string email, string password, string firstName, string lastName, string? phone = null, string role = "User");
    Task<bool> ResetPasswordAsync(Guid userId, string newPassword);
    Task<bool> ResetPasswordByEmailAsync(string email, string newPassword);
    string HashPassword(string password);
    bool VerifyPassword(string password, string hash);
}