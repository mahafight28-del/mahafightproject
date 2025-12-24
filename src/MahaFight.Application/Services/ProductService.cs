using MahaFight.Application.DTOs;
using MahaFight.Application.Interfaces;
using MahaFight.Domain.Entities;
using MahaFight.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MahaFight.Application.Services;

public class ProductService
{
    private readonly IRepository<Product> _productRepository;
    private readonly IRepository<ProductImage> _productImageRepository;
    private readonly IFileUploadService _fileUploadService;
    private readonly IQrCodeService _qrCodeService;

    public ProductService(
        IRepository<Product> productRepository,
        IRepository<ProductImage> productImageRepository,
        IFileUploadService fileUploadService,
        IQrCodeService qrCodeService)
    {
        _productRepository = productRepository;
        _productImageRepository = productImageRepository;
        _fileUploadService = fileUploadService;
        _qrCodeService = qrCodeService;
    }

    public async Task<IEnumerable<ProductResponseDto>> GetAllProductsAsync()
    {
        var products = await _productRepository.GetAllWithImagesAsync();
        return products.Select(p => MapToDto(p));
    }

    public async Task<ProductResponseDto?> GetProductByIdAsync(Guid id)
    {
        var product = await _productRepository.GetByIdWithImagesAsync(id);
        return product == null ? null : MapToDto(product);
    }

    public async Task<ProductResponseDto> CreateProductAsync(CreateProductRequest request)
    {
        var sku = request.Sku ?? await GenerateUniqueSku(request.Name);
        
        var product = new Product
        {
            Sku = sku,
            Name = request.Name,
            Description = request.Description,
            Category = request.Category,
            Brand = request.Brand,
            UnitPrice = request.UnitPrice,
            CostPrice = request.CostPrice,
            StockQuantity = request.StockQuantity,
            MinStockLevel = request.MinStockLevel ?? 10,
            Weight = request.Weight,
            Dimensions = request.Dimensions,
            IsActive = true
        };

        var created = await _productRepository.AddAsync(product);

        // Generate QR code
        var qrData = $"https://mahafight.com/products/{created.Id}";
        var qrFileName = $"product_{created.Id}";
        var qrCodePath = await _qrCodeService.GenerateQrCodeAsync(qrData, qrFileName);

        return MapToDto(created, qrCodePath);
    }

    public async Task<ProductResponseDto?> UpdateProductAsync(UpdateProductRequest request)
    {
        var product = await _productRepository.GetByIdAsync(request.Id);
        if (product == null) return null;

        product.Name = request.Name;
        product.Sku = request.Sku;
        product.Description = request.Description;
        product.Category = request.Category;
        product.Brand = request.Brand;
        product.UnitPrice = request.UnitPrice;
        product.CostPrice = request.CostPrice;
        product.StockQuantity = request.StockQuantity;
        product.MinStockLevel = request.MinStockLevel ?? product.MinStockLevel;
        product.Weight = request.Weight;
        product.Dimensions = request.Dimensions;
        product.UpdatedAt = DateTime.UtcNow;

        await _productRepository.UpdateAsync(product);
        return MapToDto(product);
    }

    public async Task<bool> DeleteProductAsync(Guid id)
    {
        var product = await _productRepository.GetByIdAsync(id);
        if (product == null) return false;

        product.IsActive = false;
        product.UpdatedAt = DateTime.UtcNow;
        await _productRepository.UpdateAsync(product);
        return true;
    }

    private static ProductResponseDto MapToDto(Product product, string? qrCodePath = null)
    {
        var commissionPercentage = product.UnitPrice > 0 
            ? (1 - product.CostPrice / product.UnitPrice) * 100 
            : 0;

        var images = product.Images?.Select(img => new ProductImageDto(
            img.Id,
            img.FileName,
            img.ImageUrl, // Use Cloudinary URL directly
            img.IsDefault,
            img.DisplayOrder
        )).OrderBy(img => img.DisplayOrder) ?? Enumerable.Empty<ProductImageDto>();

        var defaultImage = images.FirstOrDefault(img => img.IsDefault)?.Url ?? images.FirstOrDefault()?.Url;

        return new ProductResponseDto(
            product.Id,
            product.Name,
            product.UnitPrice,
            commissionPercentage,
            product.Description,
            product.Category,
            product.Brand,
            defaultImage,
            qrCodePath ?? $"qrcodes/product_{product.Id}.png",
            product.IsActive,
            product.CreatedAt,
            product.Sku,
            product.CostPrice,
            product.StockQuantity,
            product.MinStockLevel,
            product.Weight,
            product.Dimensions,
            images
        );
    }

    private async Task<string> GenerateUniqueSku(string productName)
    {
        string sku;
        bool exists;
        do
        {
            sku = GenerateSku(productName);
            var products = await _productRepository.GetAllAsync();
            exists = products.Any(p => p.Sku == sku);
        } while (exists);
        
        return sku;
    }

    private static string GenerateSku(string productName)
    {
        var prefix = string.Concat(productName.Take(3)).ToUpper();
        var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
        var random = new Random().Next(1000, 9999);
        return $"{prefix}-{timestamp}-{random}";
    }
}