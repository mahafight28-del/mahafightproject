using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MahaFight.Application.DTOs;
using MahaFight.Application.Services;
using MahaFight.WebApi.Authorization;

namespace MahaFight.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[DealerOrAdmin]
[EnableRateLimiting("ApiPolicy")]
public class SalesController : ControllerBase
{
    private readonly InvoiceService _invoiceService;

    public SalesController(InvoiceService invoiceService)
    {
        _invoiceService = invoiceService;
    }

    [HttpPost]
    public async Task<ActionResult<SaleResponseDto>> CreateSale([FromBody] CreateSaleRequest request)
    {
        try
        {
            var sale = await _invoiceService.CreateSaleAsync(request);
            return Ok(sale);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetSales()
    {
        var sales = await _invoiceService.GetAllSalesAsync();
        return Ok(sales);
    }

    [HttpGet("{id}/pdf")]
    public async Task<IActionResult> GetSalePdf(Guid id)
    {
        try
        {
            var sale = await _invoiceService.GetSaleByIdAsync(id);
            if (sale == null) return NotFound();

            // Simple text receipt
            var content = $"MAHA FIGHT - SALES RECEIPT\n\n";
            content += $"Sale Number: {sale.SaleNumber}\n";
            content += $"Date: {sale.SaleDate:dd/MM/yyyy HH:mm}\n";
            content += $"Customer: {sale.CustomerName ?? "Walk-in Customer"}\n\n";
            content += "ITEMS:\n";
            content += "----------------------------------------\n";
            
            foreach (var item in sale.Items)
            {
                content += $"{item.ProductName}\n";
                content += $"  Qty: {item.Quantity} x ₹{item.UnitPrice} = ₹{item.LineTotal}\n\n";
            }
            
            content += "----------------------------------------\n";
            content += $"Subtotal: ₹{sale.Subtotal}\n";
            content += $"Tax (18%): ₹{sale.TaxAmount}\n";
            content += $"TOTAL: ₹{sale.TotalAmount}\n\n";
            content += "Thank you for your business!";

            var bytes = System.Text.Encoding.UTF8.GetBytes(content);
            return File(bytes, "text/plain", $"receipt-{sale.SaleNumber}.txt");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetSale(Guid id)
    {
        var sale = await _invoiceService.GetSaleByIdAsync(id);
        return sale == null ? NotFound() : Ok(sale);
    }

    [HttpPut("{id}/payment-status")]
    [AdminOnly]
    public async Task<ActionResult> UpdatePaymentStatus(Guid id, [FromBody] UpdatePaymentStatusRequest request)
    {
        try
        {
            var success = await _invoiceService.UpdateSalePaymentStatusAsync(id, request.PaymentStatus);
            return success ? Ok("Payment status updated") : NotFound("Sale not found");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}

public record UpdatePaymentStatusRequest(string PaymentStatus);