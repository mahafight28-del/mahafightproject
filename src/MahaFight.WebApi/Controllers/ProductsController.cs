using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MahaFight.Application.DTOs;
using MahaFight.Application.Services;
using MahaFight.Application.Interfaces;
using MahaFight.Domain.Entities;
using MahaFight.Domain.Interfaces;
using MahaFight.WebApi.Authorization;

namespace MahaFight.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("ApiPolicy")]
public class ProductsController : ControllerBase
{
    private readonly ProductService _productService;
    private readonly ICsvExportService _csvExportService;
    private readonly IRepository<Product> _productRepository;
    private readonly IRepository<ProductImage> _productImageRepository;
    private readonly ICloudinaryService _cloudinaryService;

    public ProductsController(
        ProductService productService, 
        ICsvExportService csvExportService, 
        IRepository<Product> productRepository,
        IRepository<ProductImage> productImageRepository,
        ICloudinaryService cloudinaryService)
    {
        _productService = productService;
        _csvExportService = csvExportService;
        _productRepository = productRepository;
        _productImageRepository = productImageRepository;
        _cloudinaryService = cloudinaryService;
    }

    [HttpGet]
    [DealerOrAdmin]
    public async Task<ActionResult<ApiResponse<IEnumerable<ProductResponseDto>>>> GetProducts()
    {
        try
        {
            var products = await _productService.GetAllProductsAsync();
            return Ok(ApiResponse<IEnumerable<ProductResponseDto>>.SuccessResult(products));
        }
        catch (Exception ex)
        {
            // Fallback for missing columns
            var fallbackProducts = new List<ProductResponseDto>();
            return Ok(ApiResponse<IEnumerable<ProductResponseDto>>.SuccessResult(fallbackProducts, "Database schema update pending"));
        }
    }

    [HttpGet("{id}")]
    [DealerOrAdmin]
    public async Task<ActionResult<ProductResponseDto>> GetProduct(Guid id)
    {
        try
        {
            var product = await _productService.GetProductByIdAsync(id);
            return product == null ? NotFound() : Ok(product);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Database schema update pending", error = ex.Message });
        }
    }

    [HttpPost]
    [AdminOnly]
    public async Task<ActionResult<ProductResponseDto>> CreateProduct([FromBody] CreateProductRequest request)
    {
        var product = await _productService.CreateProductAsync(request);
        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
    }

    [HttpPut("{id}")]
    [AdminOnly]
    public async Task<ActionResult<ProductResponseDto>> UpdateProduct(Guid id, [FromBody] UpdateProductRequest request)
    {
        if (id != request.Id)
            return BadRequest("ID mismatch");

        var product = await _productService.UpdateProductAsync(request);
        return product == null ? NotFound() : Ok(product);
    }

    [HttpDelete("{id}")]
    [AdminOnly]
    public async Task<ActionResult> DeleteProduct(Guid id)
    {
        var success = await _productService.DeleteProductAsync(id);
        return success ? Ok("Product deleted") : NotFound();
    }

    [HttpGet("export")]
    [AdminOnly]
    public async Task<ActionResult> ExportProducts()
    {
        var products = await _productRepository.GetAllAsync();
        var csvData = _csvExportService.ExportProducts(products);
        
        return File(csvData, "text/csv", $"products_{DateTime.UtcNow:yyyyMMdd}.csv");
    }

    [HttpPost("{id}/images")]
    [AdminOnly]
    public async Task<ActionResult<ProductImageDto>> UploadProductImage(Guid id, IFormFile file, [FromForm] bool isDefault = false, [FromForm] int displayOrder = 0)
    {
        var product = await _productRepository.GetByIdAsync(id);
        if (product == null)
            return NotFound("Product not found");

        try
        {
            var (imageUrl, publicId) = await _cloudinaryService.UploadImageAsync(file, "products");
            
            var productImage = new ProductImage
            {
                ProductId = id,
                FileName = file.FileName,
                ImageUrl = imageUrl,
                PublicId = publicId,
                ContentType = file.ContentType,
                FileSize = file.Length,
                IsDefault = isDefault,
                DisplayOrder = displayOrder
            };

            // If this is set as default, unset other defaults
            if (isDefault)
            {
                var existingImages = await _productImageRepository.GetAllAsync();
                var productImages = existingImages.Where(img => img.ProductId == id && img.IsDefault);
                foreach (var img in productImages)
                {
                    img.IsDefault = false;
                    await _productImageRepository.UpdateAsync(img);
                }
            }

            var createdImage = await _productImageRepository.AddAsync(productImage);
            
            var imageDto = new ProductImageDto(
                createdImage.Id,
                createdImage.FileName,
                createdImage.ImageUrl,
                createdImage.IsDefault,
                createdImage.DisplayOrder
            );

            return Ok(imageDto);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("{id}/images")]
    [DealerOrAdmin]
    public async Task<ActionResult<IEnumerable<ProductImageDto>>> GetProductImages(Guid id)
    {
        var images = await _productImageRepository.GetAllAsync();
        var productImages = images.Where(img => img.ProductId == id)
            .OrderBy(img => img.DisplayOrder)
            .Select(img => new ProductImageDto(
                img.Id,
                img.FileName,
                img.ImageUrl,
                img.IsDefault,
                img.DisplayOrder
            ));
        
        return Ok(productImages);
    }

    [HttpDelete("{id}/images/{imageId}")]
    [AdminOnly]
    public async Task<ActionResult> DeleteProductImage(Guid id, Guid imageId)
    {
        var image = await _productImageRepository.GetByIdAsync(imageId);
        if (image == null || image.ProductId != id)
            return NotFound("Image not found");

        await _cloudinaryService.DeleteImageAsync(image.PublicId);
        await _productImageRepository.DeleteAsync(imageId);
        
        return Ok("Image deleted successfully");
    }
}