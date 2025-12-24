using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MahaFight.Application.DTOs;
using MahaFight.Application.Services;
using MahaFight.WebApi.Authorization;

namespace MahaFight.WebApi.Controllers;

public record CreateInvoiceFromSaleRequest(Guid SaleId);

[ApiController]
[Route("api/[controller]")]
[DealerOrAdmin]
[EnableRateLimiting("ApiPolicy")]
public class InvoicesController : ControllerBase
{
    private readonly InvoiceService _invoiceService;

    public InvoicesController(InvoiceService invoiceService)
    {
        _invoiceService = invoiceService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<InvoiceResponseDto>>> GetInvoices([FromQuery] Guid? dealerId)
    {
        if (dealerId.HasValue)
        {
            var invoices = await _invoiceService.GetDealerInvoicesAsync(dealerId.Value);
            return Ok(invoices);
        }
        
        // Admin can get all invoices
        var allInvoices = await _invoiceService.GetAllInvoicesAsync();
        return Ok(allInvoices);
    }

    [HttpPost]
    public async Task<ActionResult<InvoiceResponseDto>> CreateInvoiceFromSale([FromBody] CreateInvoiceFromSaleRequest request)
    {
        try
        {
            var invoice = await _invoiceService.CreateInvoiceForSaleAsync(request.SaleId);
            return CreatedAtAction(nameof(GetInvoicePdf), new { invoiceId = invoice.Id }, invoice);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("dealer/{dealerId}")]
    public async Task<ActionResult<IEnumerable<InvoiceResponseDto>>> GetDealerInvoices(Guid dealerId)
    {
        var invoices = await _invoiceService.GetDealerInvoicesAsync(dealerId);
        return Ok(invoices);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetInvoice(Guid id)
    {
        var invoices = await _invoiceService.GetAllInvoicesAsync();
        var invoice = invoices.FirstOrDefault(i => i.Id == id);
        if (invoice == null) return NotFound();
        
        // Get sale details with items
        var sale = await _invoiceService.GetSaleByIdAsync(invoice.SaleId);
        
        return Ok(new {
            id = invoice.Id,
            invoiceNumber = invoice.InvoiceNumber,
            saleId = invoice.SaleId,
            dealerName = invoice.DealerName,
            invoiceDate = invoice.InvoiceDate,
            dueDate = invoice.DueDate,
            totalAmount = invoice.TotalAmount,
            paidAmount = invoice.PaidAmount,
            balanceAmount = invoice.BalanceAmount,
            status = invoice.Status,
            taxAmount = sale?.TaxAmount ?? 0,
            items = sale?.Items ?? new List<SaleItemDto>()
        });
    }

    [HttpGet("{invoiceId}/pdf")]
    public async Task<ActionResult> GetInvoicePdf(Guid invoiceId)
    {
        try
        {
            var pdfBytes = await _invoiceService.GenerateInvoicePdfAsync(invoiceId);
            if (pdfBytes == null || pdfBytes.Length == 0)
            {
                return BadRequest("Failed to generate PDF");
            }
            return File(pdfBytes, "application/pdf", $"invoice_{invoiceId}.pdf");
        }
        catch (Exception ex)
        {
            return BadRequest($"PDF generation failed: {ex.Message}");
        }
    }

    [HttpPut("{invoiceId}/status")]
    public async Task<ActionResult> UpdateInvoiceStatus(Guid invoiceId, [FromBody] UpdateInvoiceStatusRequest request)
    {
        try
        {
            await _invoiceService.UpdateInvoiceStatusAsync(invoiceId, request.Status, request.PaidAmount);
            return Ok("Invoice status updated");
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}