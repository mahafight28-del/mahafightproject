using MahaFight.Application.DTOs;
using MahaFight.Domain.Entities;
using MahaFight.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace MahaFight.Application.Services;

public class ProductScanService
{
    private readonly IRepository<Product> _productRepository;
    private readonly ILogger<ProductScanService> _logger;

    public ProductScanService(IRepository<Product> productRepository, ILogger<ProductScanService> logger)
    {
        _productRepository = productRepository;
        _logger = logger;
    }

    public async Task<ProductDto?> GetProductByCodeAsync(string code)
    {
        _logger.LogInformation($"[DEBUG] Scanning code: {code}");
        
        var products = await _productRepository.GetAllAsync();
        _logger.LogInformation($"[DEBUG] Found {products.Count()} products in database");
        
        // Extract product ID from URL if it's a full URL
        var searchCode = code;
        if (code.StartsWith("https://mahafight.com/products/") || 
            code.StartsWith("https://mahafight-api.onrender.com/products/") ||
            code.StartsWith("http://localhost:5173/products/"))
        {
            if (code.StartsWith("https://mahafight.com/products/"))
                searchCode = code.Substring("https://mahafight.com/products/".Length);
            else if (code.StartsWith("https://mahafight-api.onrender.com/products/"))
                searchCode = code.Substring("https://mahafight-api.onrender.com/products/".Length);
            else if (code.StartsWith("http://localhost:5173/products/"))
                searchCode = code.Substring("http://localhost:5173/products/".Length);
        }
        
        _logger.LogInformation($"[DEBUG] Search code after URL extraction: {searchCode}");
        
        var product = products.FirstOrDefault(p => 
            p.IsActive && (
                p.Sku.Equals(searchCode, StringComparison.OrdinalIgnoreCase) ||
                p.Barcode == searchCode ||
                p.QrCode == searchCode ||
                p.Id.ToString().Equals(searchCode, StringComparison.OrdinalIgnoreCase)
            ));

        _logger.LogInformation($"[DEBUG] Product found: {product?.Name ?? "NULL"}");
        
        if (product == null) return null;

        return new ProductDto(
            product.Id,
            product.Sku,
            product.Name,
            product.Description,
            product.Category,
            product.Brand,
            product.UnitPrice,
            product.CostPrice,
            product.StockQuantity,
            product.IsActive
        );
    }

    public string GenerateQrCode(Guid productId, string sku)
    {
        return $"{{\"productId\":\"{productId}\",\"sku\":\"{sku}\"}}";
    }
}