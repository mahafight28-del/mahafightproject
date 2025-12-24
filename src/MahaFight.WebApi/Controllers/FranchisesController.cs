using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MahaFight.Application.DTOs;
using MahaFight.Domain.Entities;
using MahaFight.Domain.Interfaces;
using MahaFight.WebApi.Authorization;

namespace MahaFight.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[AdminOnly]
public class FranchisesController : ControllerBase
{
    private readonly IRepository<Franchise> _franchiseRepository;
    private readonly IRepository<User> _userRepository;

    public FranchisesController(IRepository<Franchise> franchiseRepository, IRepository<User> userRepository)
    {
        _franchiseRepository = franchiseRepository;
        _userRepository = userRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<FranchiseDto>>> GetFranchises()
    {
        var franchises = await _franchiseRepository.GetAllAsync();
        var users = await _userRepository.GetAllAsync();
        
        var franchiseDtos = franchises.Select(f => {
            var owner = users.FirstOrDefault(u => u.Id == f.OwnerId);
            return new FranchiseDto(
                f.Id,
                f.FranchiseName,
                f.FranchiseCode,
                f.OwnerId,
                owner != null ? $"{owner.FirstName} {owner.LastName}" : "Unknown Owner",
                f.Territory,
                f.Address,
                f.City,
                f.State,
                f.PostalCode,
                f.Country,
                f.FranchiseFee,
                f.RoyaltyRate,
                f.ContractStartDate,
                f.ContractEndDate,
                f.Status,
                f.CreatedAt
            );
        });
        
        return Ok(franchiseDtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Franchise>> GetFranchise(Guid id)
    {
        var franchise = await _franchiseRepository.GetByIdAsync(id);
        return franchise == null ? NotFound() : Ok(franchise);
    }

    [HttpPost]
    public async Task<ActionResult<Franchise>> CreateFranchise(CreateFranchiseRequest request)
    {
        var franchise = new Franchise
        {
            FranchiseName = request.FranchiseName,
            FranchiseCode = request.FranchiseCode,
            OwnerId = request.OwnerId,
            Territory = request.Territory,
            Address = request.Address,
            City = request.City,
            State = request.State,
            PostalCode = request.PostalCode,
            Country = request.Country,
            FranchiseFee = request.FranchiseFee,
            RoyaltyRate = request.RoyaltyRate,
            ContractStartDate = request.ContractStartDate,
            ContractEndDate = request.ContractEndDate,
            Status = "Active"
        };
        
        var created = await _franchiseRepository.AddAsync(franchise);
        return CreatedAtAction(nameof(GetFranchise), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Franchise>> UpdateFranchise(Guid id, CreateFranchiseRequest request)
    {
        var franchise = await _franchiseRepository.GetByIdAsync(id);
        if (franchise == null) return NotFound();
        
        franchise.FranchiseName = request.FranchiseName;
        franchise.FranchiseCode = request.FranchiseCode;
        franchise.OwnerId = request.OwnerId;
        franchise.Territory = request.Territory;
        franchise.Address = request.Address;
        franchise.City = request.City;
        franchise.State = request.State;
        franchise.PostalCode = request.PostalCode;
        franchise.Country = request.Country;
        franchise.FranchiseFee = request.FranchiseFee;
        franchise.RoyaltyRate = request.RoyaltyRate;
        franchise.ContractStartDate = request.ContractStartDate;
        franchise.ContractEndDate = request.ContractEndDate;
        
        await _franchiseRepository.UpdateAsync(franchise);
        return Ok(franchise);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteFranchise(Guid id)
    {
        await _franchiseRepository.DeleteAsync(id);
        return Ok();
    }
}