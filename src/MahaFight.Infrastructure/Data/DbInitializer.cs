using MahaFight.Domain.Entities;
using System.Security.Cryptography;
using System.Text;

namespace MahaFight.Infrastructure.Data;

public static class DbInitializer
{
    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var salt = Guid.NewGuid().ToString();
        var saltedPassword = password + salt;
        var hash = Convert.ToBase64String(sha256.ComputeHash(Encoding.UTF8.GetBytes(saltedPassword)));
        return $"{salt}:{hash}";
    }

    public static async Task SeedAsync(ApplicationDbContext context)
    {
        if (!context.Users.Any())
        {
            var users = new[]
            {
                new User { Email = "admin@mahafight.com", PasswordHash = HashPassword("admin123"), FirstName = "Admin", LastName = "User", Role = "Admin" },
                new User { Email = "dealer1@elite.com", PasswordHash = HashPassword("dealer123"), FirstName = "John", LastName = "Smith", Phone = "+1-555-0101", Role = "Dealer" },
                new User { Email = "dealer2@champion.com", PasswordHash = HashPassword("dealer123"), FirstName = "Jane", LastName = "Doe", Phone = "+1-555-0102", Role = "Dealer" }
            };
            context.Users.AddRange(users);
            await context.SaveChangesAsync();

            var dealers = new[]
            {
                new Dealer { UserId = users[1].Id, BusinessName = "Elite Combat Sports", BusinessType = "Retail", Address = "123 Fighter St", City = "Las Vegas", State = "NV", PostalCode = "89101" },
                new Dealer { UserId = users[2].Id, BusinessName = "Champion Martial Arts", BusinessType = "Training", Address = "456 Victory Ave", City = "Miami", State = "FL", PostalCode = "33101" }
            };
            context.Dealers.AddRange(dealers);
            await context.SaveChangesAsync();

            var products = new[]
            {
                new Product { Sku = "GLOVE-001", Name = "Boxing Gloves Pro", Category = "Equipment", Brand = "MAHA", UnitPrice = 89.99m, CostPrice = 45.00m, StockQuantity = 100 },
                new Product { Sku = "GEAR-002", Name = "Training Gear Set", Category = "Equipment", Brand = "MAHA", UnitPrice = 149.99m, CostPrice = 75.00m, StockQuantity = 50 }
            };
            context.Products.AddRange(products);
            await context.SaveChangesAsync();
        }
    }
}