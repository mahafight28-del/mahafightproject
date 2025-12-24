using MahaFight.Application.DTOs;
using MahaFight.Domain.Entities;
using MahaFight.Domain.Interfaces;

namespace MahaFight.Application.Services;

public class ProductScanService
{
    private readonly IRepository<Product> _productRepository;

    public ProductScanService(IRepository<Product> productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<ProductDto?> GetProductByCodeAsync(string code)
    {
        var products = await _productRepository.GetAllAsync();
        
        var product = products.FirstOrDefault(p => 
            p.IsActive && (
                p.Sku.Equals(code, StringComparison.OrdinalIgnoreCase) ||
                p.Barcode == code ||
                p.QrCode == code
            ));

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