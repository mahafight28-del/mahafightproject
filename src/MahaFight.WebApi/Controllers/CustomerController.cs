using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using MahaFight.Application.DTOs;
using MahaFight.Application.Services;

namespace MahaFight.WebApi.Controllers;

[ApiController]
[Route("api/customer")]
[Authorize(Roles = "Customer")]
public class CustomerController : ControllerBase
{
    private readonly CustomerOrderService _customerOrderService;

    public CustomerController(CustomerOrderService customerOrderService)
    {
        _customerOrderService = customerOrderService;
    }

    [HttpPost("orders")]
    public async Task<ActionResult<CustomerOrderResponseDto>> PlaceOrder([FromBody] PlaceOrderRequest request)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        
        var order = await _customerOrderService.PlaceOrderAsync(userId, request);
        return Ok(order);
    }

    [HttpGet("orders")]
    public async Task<ActionResult<IEnumerable<CustomerOrderResponseDto>>> GetMyOrders()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        
        var orders = await _customerOrderService.GetCustomerOrdersAsync(userId);
        return Ok(orders);
    }

    [HttpGet("orders/{orderId}")]
    public async Task<ActionResult<CustomerOrderResponseDto>> GetOrder(Guid orderId)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        
        var order = await _customerOrderService.GetCustomerOrderAsync(userId, orderId);
        return order == null ? NotFound() : Ok(order);
    }
}