using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MahaFight.Application.Services;

namespace MahaFight.WebApi.Controllers;

[ApiController]
[Route("api/pos")]
[Authorize]
public class PosController : ControllerBase
{
    private readonly ProductScanService _scanService;

    public PosController(ProductScanService scanService)
    {
        _scanService = scanService;
    }

    [HttpGet("scan/{code}")]
    public async Task<IActionResult> ScanProduct(string code)
    {
        var product = await _scanService.GetProductByCodeAsync(code);
        
        if (product == null)
            return NotFound(new { message = "Product not found" });

        if (product.StockQuantity <= 0)
            return BadRequest(new { message = "Product out of stock" });

        return Ok(product);
    }
}