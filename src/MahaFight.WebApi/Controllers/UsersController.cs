using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MahaFight.Application.Interfaces;
using MahaFight.Application.Services;
using MahaFight.Domain.Entities;
using MahaFight.Domain.Interfaces;
using MahaFight.WebApi.Authorization;

namespace MahaFight.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("ApiPolicy")]
public class UsersController : ControllerBase
{
    private readonly IRepository<User> _userRepository;
    private readonly IRepository<Dealer> _dealerRepository;
    private readonly IAuthService _authService;

    public UsersController(IRepository<User> userRepository, IRepository<Dealer> dealerRepository, IAuthService authService)
    {
        _userRepository = userRepository;
        _dealerRepository = dealerRepository;
        _authService = authService;
    }

    [HttpGet]
    [AdminOnly]
    public async Task<ActionResult<IEnumerable<object>>> GetUsers()
    {
        var users = await _userRepository.GetAllAsync();
        var dto = users.Select(u => new {
            u.Id,
            u.Email,
            u.FirstName,
            u.LastName,
            u.Phone,
            u.Role,
            u.IsActive,
            u.CreatedAt,
            u.UpdatedAt
        });
        return Ok(dto);
    }

    [HttpGet("{id}")]
    [DealerOrAdmin]
    public async Task<ActionResult<object>> GetUser(Guid id)
    {
        var currentUserId = User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
        var currentUserRole = User.FindFirst("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
        
        // Admin can view any user, Dealer can only view their own profile
        if (currentUserRole != "Admin" && currentUserId != id.ToString())
        {
            return Forbid("You can only view your own profile");
        }
        
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return NotFound();
        return Ok(new { user.Id, user.Email, user.FirstName, user.LastName, user.Phone, user.Role, user.IsActive, user.CreatedAt, user.UpdatedAt });
    }

    [HttpPost]
    [AdminOnly]
    public async Task<ActionResult> CreateUser([FromBody] CreateUserRequest req)
    {
        var created = await _authService.RegisterUserAsync(req.Email, req.Password, req.FirstName, req.LastName, req.Phone, req.Role ?? "User");
        if (!created) return BadRequest("User already exists");
        
        var user = (await _userRepository.GetAllAsync()).FirstOrDefault(u => u.Email == req.Email);
        
        // If role is Dealer, create dealer record
        if (req.Role == "Dealer" && user != null)
        {
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
                Status = "Active"
            };
            await _dealerRepository.AddAsync(dealer);
        }
        
        return CreatedAtAction(nameof(GetUser), new { id = user?.Id }, new { user?.Id, user?.Email, user?.FirstName, user?.LastName, user?.Role });
    }

    [HttpPut("{id}")]
    [DealerOrAdmin]
    public async Task<ActionResult> UpdateUser(Guid id, [FromBody] UpdateUserRequest req)
    {
        if (id != req.Id) return BadRequest("ID mismatch");
        
        var currentUserId = User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
        var currentUserRole = User.FindFirst("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
        
        // Admin can update any user, Dealer can only update their own profile (limited fields)
        if (currentUserRole != "Admin" && currentUserId != id.ToString())
        {
            return Forbid("You can only update your own profile");
        }
        
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return NotFound();
        
        user.FirstName = req.FirstName ?? user.FirstName;
        user.LastName = req.LastName ?? user.LastName;
        user.Phone = req.Phone ?? user.Phone;
        
        // Only admin can change role and active status
        if (currentUserRole == "Admin")
        {
            // Check if email is being changed and if it already exists
            if (!string.IsNullOrEmpty(req.Email) && req.Email != user.Email)
            {
                var existingUser = (await _userRepository.GetAllAsync()).FirstOrDefault(u => u.Email == req.Email);
                if (existingUser != null)
                {
                    return BadRequest("Email already exists");
                }
                user.Email = req.Email;
            }
            user.Role = req.Role ?? user.Role;
            
            // If isActive status is changing and user is a dealer, sync dealer status
            if (req.IsActive.HasValue && req.IsActive != user.IsActive && user.Role == "Dealer")
            {
                var dealers = await _dealerRepository.GetAllAsync();
                var dealer = dealers.FirstOrDefault(d => d.UserId == user.Id);
                if (dealer != null)
                {
                    dealer.Status = req.IsActive.Value ? "Active" : "Inactive";
                    await _dealerRepository.UpdateAsync(dealer);
                }
            }
            
            // Sync other fields for dealers
            if (user.Role == "Dealer")
            {
                var dealers = await _dealerRepository.GetAllAsync();
                var dealer = dealers.FirstOrDefault(d => d.UserId == user.Id);
                if (dealer != null)
                {
                    // Sync name to business name if changed
                    var newBusinessName = $"{req.FirstName ?? user.FirstName} {req.LastName ?? user.LastName} Business";
                    if (dealer.BusinessName != newBusinessName)
                    {
                        dealer.BusinessName = newBusinessName;
                        await _dealerRepository.UpdateAsync(dealer);
                    }
                }
            }
            
            user.IsActive = req.IsActive ?? user.IsActive;
        }
        
        await _userRepository.UpdateAsync(user);
        return Ok(new { user.Id, user.Email, user.FirstName, user.LastName, user.Phone, user.Role, user.IsActive });
    }

    [HttpDelete("{id}")]
    [AdminOnly]
    public async Task<ActionResult> DeleteUser(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return NotFound();
        await _userRepository.DeleteAsync(id);
        return Ok("User deleted");
    }

    public record CreateUserRequest(string Email, string Password, string FirstName, string LastName, string? Phone, string? Role);
    public record UpdateUserRequest(Guid Id, string? FirstName, string? LastName, string? Email, string? Phone, string? Role, bool? IsActive);
}
