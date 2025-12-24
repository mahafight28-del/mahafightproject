using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;
using MahaFight.Application.DTOs;
using MahaFight.Application.Services;
using MahaFight.Domain.Entities;
using MahaFight.Domain.Interfaces;
using MahaFight.WebApi.Authorization;

namespace MahaFight.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DealersController : ControllerBase
{
    private readonly DealerService _dealerService;
    private readonly IRepository<Dealer> _dealerRepository;
    private readonly ICsvExportService _csvExportService;

    public DealersController(DealerService dealerService, IRepository<Dealer> dealerRepository, ICsvExportService csvExportService)
    {
        _dealerService = dealerService;
        _dealerRepository = dealerRepository;
        _csvExportService = csvExportService;
    }

    [HttpPost("{dealerId}/kyc/upload")]
    [DealerOrAdmin]
    public async Task<ActionResult<KycDocumentDto>> UploadKycDocument(
        Guid dealerId, 
        [FromForm] string documentType,
        [FromForm] string documentNumber,
        [FromForm] IFormFile documentFile)
    {
        try
        {
            // Note: dealerId parameter is actually userId from frontend
            var request = new KycDocumentUploadRequest(dealerId, documentType, documentNumber, documentFile);
            var result = await _dealerService.UploadKycDocumentAsync(request);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("{dealerId}/kyc")]
    [DealerOrAdmin]
    public async Task<ActionResult<IEnumerable<KycDocumentDto>>> GetKycDocuments(Guid dealerId)
    {
        try
        {
            var userRole = User.FindFirst("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            
            if (userRole == "Admin")
            {
                // For admin, dealerId is actual dealer ID
                var documents = await _dealerService.GetKycDocumentsByDealerIdAsync(dealerId);
                return Ok(documents);
            }
            else
            {
                // For dealer, dealerId is actually userId from frontend
                var documents = await _dealerService.GetDealerKycDocumentsAsync(dealerId);
                return Ok(documents);
            }
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{dealerId}/approve")]
    [AdminOnly]
    public async Task<ActionResult> ApproveDealer(Guid dealerId, [FromBody] DealerApprovalRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userId, out var approvedBy))
            return Unauthorized();

        // For admin, dealerId is actual dealer ID
        var success = await _dealerService.ApproveDealerAsync(
            new DealerApprovalRequest(dealerId, request.Status, request.Notes), 
            approvedBy);
        
        return success ? Ok("Dealer status updated") : NotFound("Dealer not found");
    }

    [HttpPost]
    [AdminOnly]
    public async Task<ActionResult<DealerDto>> CreateDealer([FromBody] DealerRegistrationRequest request)
    {
        try
        {
            var result = await _dealerService.RegisterDealerAsync(request);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet]
    [DealerOrAdmin]
    public async Task<ActionResult<ApiResponse<IEnumerable<DealerDto>>>> GetDealers()
    {
        var userRole = User.FindFirst("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
        var userId = User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
        
        // Auto-sync dealers before returning data
        await AutoSyncDealers();
        
        var dealers = await _dealerService.GetAllAsync();
        
        // If dealer, return only their own dealer record
        if (userRole == "Dealer" && Guid.TryParse(userId, out var dealerUserId))
        {
            var allDealers = await _dealerRepository.GetAllAsync();
            var userDealer = allDealers.FirstOrDefault(d => d.UserId == dealerUserId);
            if (userDealer != null)
            {
                dealers = dealers.Where(d => d.Id == userDealer.Id);
            }
        }
        
        return Ok(ApiResponse<IEnumerable<DealerDto>>.SuccessResult(dealers));
    }

    private async Task AutoSyncDealers()
    {
        var userRepository = HttpContext.RequestServices.GetRequiredService<IRepository<User>>();
        var users = await userRepository.GetAllAsync();
        var dealers = await _dealerRepository.GetAllAsync();
        var dealerUsers = users.Where(u => u.Role == "Dealer");
        
        foreach (var user in dealerUsers)
        {
            var existingDealer = dealers.FirstOrDefault(d => d.UserId == user.Id);
            if (existingDealer == null)
            {
                // Create new dealer record
                var dealer = new Dealer
                {
                    UserId = user.Id,
                    BusinessName = $"{user.FirstName} {user.LastName} Business",
                    BusinessType = "General",
                    Address = "Address not provided",
                    City = "City not provided",
                    State = "State not provided",
                    PostalCode = "000000",
                    Country = "India",
                    Status = user.IsActive ? "Active" : "Inactive"
                };
                await _dealerRepository.AddAsync(dealer);
            }
            else
            {
                // Sync existing dealer with user data
                bool needsUpdate = false;
                
                var expectedStatus = user.IsActive ? "Active" : "Inactive";
                if (existingDealer.Status != expectedStatus)
                {
                    existingDealer.Status = expectedStatus;
                    needsUpdate = true;
                }
                
                if (needsUpdate)
                {
                    await _dealerRepository.UpdateAsync(existingDealer);
                }
            }
        }
    }

    [HttpGet("{id}")]
    [DealerOrAdmin]
    public async Task<ActionResult<DealerDto>> GetDealer(Guid id)
    {
        var dealer = await _dealerService.GetByIdAsync(id);
        return dealer == null ? NotFound() : Ok(dealer);
    }

    [HttpPut("{id}")]
    [AdminOnly]
    public async Task<ActionResult<DealerDto>> UpdateDealer(Guid id, [FromBody] DealerRegistrationRequest request)
    {
        try
        {
            var result = await _dealerService.UpdateDealerAsync(id, request);
            return result == null ? NotFound() : Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}/status")]
    [AdminOnly]
    public async Task<ActionResult> UpdateDealerStatus(Guid id, [FromBody] UpdateDealerStatusRequest request)
    {
        try
        {
            var dealer = await _dealerRepository.GetByIdAsync(id);
            if (dealer == null) return NotFound();

            // Update dealer status
            dealer.Status = request.IsActive ? "Active" : "Inactive";
            await _dealerRepository.UpdateAsync(dealer);

            // Sync user status
            var userRepository = HttpContext.RequestServices.GetRequiredService<IRepository<User>>();
            var user = await userRepository.GetByIdAsync(dealer.UserId);
            if (user != null)
            {
                user.IsActive = request.IsActive;
                await userRepository.UpdateAsync(user);
            }

            return Ok("Status updated successfully");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("export")]
    [AdminOnly]
    public async Task<ActionResult> ExportDealers()
    {
        var dealers = await _dealerRepository.GetAllAsync();
        var csvData = _csvExportService.ExportDealers(dealers);
        
        return File(csvData, "text/csv", $"dealers_{DateTime.UtcNow:yyyyMMdd}.csv");
    }
}

public record UpdateDealerStatusRequest(bool IsActive);