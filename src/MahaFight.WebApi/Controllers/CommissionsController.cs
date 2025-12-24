using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using MahaFight.Application.DTOs;
using MahaFight.Application.Services;
using MahaFight.WebApi.Authorization;

namespace MahaFight.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CommissionsController : ControllerBase
{
    private readonly CommissionService _commissionService;

    public CommissionsController(CommissionService commissionService)
    {
        _commissionService = commissionService;
    }

    [HttpGet]
    [DealerOrAdmin]
    public async Task<ActionResult<IEnumerable<CommissionDto>>> GetCommissions([FromQuery] Guid? dealerId)
    {
        if (dealerId.HasValue)
        {
            var commissions = await _commissionService.GetDealerCommissionsAsync(dealerId.Value);
            return Ok(commissions);
        }
        
        var filter = new CommissionFilterRequest();
        var allCommissions = await _commissionService.GetAllCommissionsAsync(filter);
        return Ok(allCommissions);
    }

    [HttpGet("{id}")]
    [DealerOrAdmin]
    public async Task<ActionResult<CommissionDto>> GetCommission(Guid id)
    {
        var commission = await _commissionService.GetCommissionByIdAsync(id);
        return commission == null ? NotFound() : Ok(commission);
    }

    [HttpPost("{commissionId}/mark-paid")]
    [AdminOnly]
    public async Task<ActionResult> MarkCommissionAsPaid(Guid commissionId, [FromBody] MarkCommissionPaidRequest request)
    {
        if (commissionId != request.CommissionId)
            return BadRequest("Commission ID mismatch");

        var success = await _commissionService.MarkCommissionAsPaidAsync(request);
        return success ? Ok("Commission marked as paid") : NotFound("Commission not found");
    }

    [HttpGet("dealer/{dealerId}/report")]
    [DealerOrAdmin]
    public async Task<ActionResult<CommissionReportDto>> GetDealerCommissionReport(Guid dealerId)
    {
        try
        {
            var report = await _commissionService.GetDealerCommissionReportAsync(dealerId);
            return Ok(report);
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("reports/all")]
    [AdminOnly]
    public async Task<ActionResult<IEnumerable<CommissionReportDto>>> GetAllDealersCommissionReport()
    {
        var reports = await _commissionService.GetAllDealersCommissionReportAsync();
        return Ok(reports);
    }
}