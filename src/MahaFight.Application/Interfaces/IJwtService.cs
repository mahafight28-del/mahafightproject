namespace MahaFight.Application.Interfaces;

public interface IJwtService
{
    string GenerateToken(string userId, string email, string role);
    string GenerateRefreshToken();
    bool ValidateToken(string token);
    Guid? GetUserIdFromToken(string token);
}