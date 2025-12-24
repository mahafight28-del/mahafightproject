using MahaFight.Infrastructure.Services;
using Xunit;

namespace MahaFight.Tests;

public class JwtServiceTests
{
    [Fact]
    public void GenerateToken_ReturnsValidToken()
    {
        var service = new JwtService("test-secret-key-minimum-32-chars-long", "TestIssuer");
        var token = service.GenerateToken("user123", "test@test.com", "User");
        
        Assert.NotNull(token);
        Assert.NotEmpty(token);
    }

    [Fact]
    public void ValidateToken_WithValidToken_ReturnsTrue()
    {
        var service = new JwtService("test-secret-key-minimum-32-chars-long", "TestIssuer");
        var token = service.GenerateToken("user123", "test@test.com", "User");
        
        var isValid = service.ValidateToken(token);
        
        Assert.True(isValid);
    }
}