using Microsoft.AspNetCore.Mvc;
using MahaFight.Application.DTOs;
using MahaFight.Application.Services;

namespace MahaFight.WebApi.Controllers;

[ApiController]
[Route("api/public")]
public class PublicController : ControllerBase
{
    private readonly ProductService _productService;

    public PublicController(ProductService productService)
    {
        _productService = productService;
    }

    [HttpGet("products")]
    public async Task<ActionResult<IEnumerable<PublicProductDto>>> GetProducts()
    {
        var products = await _productService.GetAllProductsAsync();
        var publicProducts = products
            .Where(p => p.IsActive)
            .Select(p => new PublicProductDto(
                p.Id,
                p.Name,
                p.Price,
                p.Description,
                p.Category,
                p.Brand,
                p.ImageUrl,
                p.StockQuantity > 0,
                p.Images
            ));
        
        return Ok(publicProducts);
    }

    [HttpGet("products/{id}")]
    public async Task<ActionResult<PublicProductDto>> GetProduct(Guid id)
    {
        var product = await _productService.GetProductByIdAsync(id);
        
        if (product == null || !product.IsActive)
            return NotFound();

        var publicProduct = new PublicProductDto(
            product.Id,
            product.Name,
            product.Price,
            product.Description,
            product.Category,
            product.Brand,
            product.ImageUrl,
            product.StockQuantity > 0,
            product.Images
        );

        return Ok(publicProduct);
    }
}