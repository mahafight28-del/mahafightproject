using MahaFight.Application.DTOs;
using MahaFight.Application.Interfaces;
using MahaFight.Domain.Entities;
using MahaFight.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace MahaFight.Application.Services;

public class ProductService
{
    private readonly IRepository<Product> _productRepository;
    private readonly IRepository<ProductImage> _productImageRepository;
    private readonly IFileUploadService _fileUploadService;
    private readonly IQrCodeService _qrCodeService;
    private readonly IBarcodeService _barcodeService;

    public ProductService(
        IRepository<Product> productRepository,
        IRepository<ProductImage> productImageRepository,
        IFileUploadService fileUploadService,
        IQrCodeService qrCodeService,
        IBarcodeService barcodeService)
    {
        _productRepository = productRepository;
        _productImageRepository = productImageRepository;
        _fileUploadService = fileUploadService;
        _qrCodeService = qrCodeService;
        _barcodeService = barcodeService;
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

        // Generate Barcode & QR code (optional - don't fail if it doesn't work)
        string? qrCodePath = null;
        string? barcodePath = null;
        
        try
        {
            // Generate barcode using SKU
            var barcodeFileName = $"barcode_{created.Id}";
            barcodePath = await _barcodeService.GenerateBarcodeAsync(sku, barcodeFileName);
            created.Barcode = barcodePath;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Barcode generation failed: {ex.Message}");
        }
        
        try
        {
            // Generate QR code with product ID only
            var qrData = created.Id.ToString();
            var qrFileName = $"qr_{created.Id}";
            qrCodePath = await _qrCodeService.GenerateQrCodeAsync(qrData, qrFileName);
            created.QrCode = qrCodePath;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"QR Code generation failed: {ex.Message}");
        }
        
        // Update product with barcode/QR paths
        if (barcodePath != null || qrCodePath != null)
        {
            await _productRepository.UpdateAsync(created);
        }

        return MapToDto(created, qrCodePath, barcodePath);
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

        // Hard delete the product
        await _productRepository.DeleteAsync(id);
        return true;
    }

    private static ProductResponseDto MapToDto(Product product, string? qrCodePath = null, string? barcodePath = null)
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
            qrCodePath ?? product.QrCode ?? $"qrcodes/qr_{product.Id}.png",
            product.IsActive,
            product.CreatedAt,
            product.Sku,
            product.CostPrice,
            product.StockQuantity,
            product.MinStockLevel,
            product.Weight,
            product.Dimensions,
            images,
            barcodePath ?? product.Barcode ?? $"barcodes/barcode_{product.Id}.png"
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