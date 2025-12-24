using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MahaFight.Application.DTOs;
using MahaFight.Application.Services;
using MahaFight.Domain.Entities;
using MahaFight.Domain.Interfaces;

namespace MahaFight.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IRepository<Sale> _saleRepository;
    private readonly IRepository<Commission> _commissionRepository;
    private readonly IRepository<Product> _productRepository;
    private readonly IRepository<Dealer> _dealerRepository;
    private readonly IRepository<User> _userRepository;
    private readonly ICsvExportService _csvExportService;

    public ReportsController(
        IRepository<Sale> saleRepository, 
        IRepository<Commission> commissionRepository, 
        IRepository<Product> productRepository,
        IRepository<Dealer> dealerRepository,
        IRepository<User> userRepository,
        ICsvExportService csvExportService)
    {
        _saleRepository = saleRepository;
        _commissionRepository = commissionRepository;
        _productRepository = productRepository;
        _dealerRepository = dealerRepository;
        _userRepository = userRepository;
        _csvExportService = csvExportService;
    }

    [HttpGet("sales-summary")]
    public async Task<ActionResult<ApiResponse<object>>> GetSalesSummary(
        [FromQuery] DateTime? fromDate, 
        [FromQuery] DateTime? toDate,
        [FromQuery] Guid? dealerId)
    {
        var sales = await _saleRepository.GetAllAsync();
        
        if (fromDate.HasValue) sales = sales.Where(s => s.SaleDate >= fromDate.Value);
        if (toDate.HasValue) sales = sales.Where(s => s.SaleDate <= toDate.Value);
        if (dealerId.HasValue) sales = sales.Where(s => s.DealerId == dealerId.Value);

        var summary = new
        {
            TotalSales = sales.Count(),
            TotalRevenue = sales.Sum(s => s.TotalAmount),
            AverageOrderValue = sales.Any() ? sales.Average(s => s.TotalAmount) : 0,
            TopDealers = sales.GroupBy(s => s.DealerId)
                .Select(g => new { 
                    DealerId = g.Key, 
                    DealerName = g.First().Dealer?.BusinessName ?? "Unknown",
                    SalesCount = g.Count(), 
                    Revenue = g.Sum(s => s.TotalAmount) 
                })
                .OrderByDescending(x => x.Revenue)
                .Take(5),
            SalesByMonth = sales.GroupBy(s => new { s.SaleDate.Year, s.SaleDate.Month })
                .Select(g => new {
                    Month = $"{g.Key.Year}-{g.Key.Month:D2}",
                    SalesCount = g.Count(),
                    Revenue = g.Sum(s => s.TotalAmount)
                })
                .OrderBy(x => x.Month)
        };

        return Ok(ApiResponse<object>.SuccessResult(summary));
    }

    [HttpGet("commission-summary")]
    public async Task<ActionResult<ApiResponse<object>>> GetCommissionSummary(
        [FromQuery] DateTime? fromDate, 
        [FromQuery] DateTime? toDate,
        [FromQuery] Guid? dealerId)
    {
        var commissions = await _commissionRepository.GetAllAsync();
        
        if (fromDate.HasValue) commissions = commissions.Where(c => c.CommissionDate >= fromDate.Value);
        if (toDate.HasValue) commissions = commissions.Where(c => c.CommissionDate <= toDate.Value);
        if (dealerId.HasValue) commissions = commissions.Where(c => c.DealerId == dealerId.Value);

        var summary = new
        {
            TotalCommissions = commissions.Sum(c => c.CommissionAmount),
            PaidCommissions = commissions.Where(c => c.PaymentStatus == "Paid").Sum(c => c.CommissionAmount),
            PendingCommissions = commissions.Where(c => c.PaymentStatus == "Pending").Sum(c => c.CommissionAmount),
            CommissionsByDealer = commissions.GroupBy(c => c.DealerId)
                .Select(g => new {
                    DealerId = g.Key,
                    DealerName = g.First().Dealer?.BusinessName ?? "Unknown",
                    TotalCommission = g.Sum(c => c.CommissionAmount),
                    PaidCommission = g.Where(c => c.PaymentStatus == "Paid").Sum(c => c.CommissionAmount),
                    PendingCommission = g.Where(c => c.PaymentStatus == "Pending").Sum(c => c.CommissionAmount)
                })
                .OrderByDescending(x => x.TotalCommission)
        };

        return Ok(ApiResponse<object>.SuccessResult(summary));
    }

    [HttpGet("low-stock")]
    public async Task<ActionResult<ApiResponse<IEnumerable<Product>>>> GetLowStockProducts()
    {
        var products = await _productRepository.GetAllAsync();
        var lowStock = products.Where(p => p.StockQuantity <= p.MinStockLevel && p.IsActive);
        
        return Ok(ApiResponse<IEnumerable<Product>>.SuccessResult(lowStock));
    }

    [HttpGet("dashboard-stats")]
    public async Task<ActionResult<ApiResponse<object>>> GetDashboardStats()
    {
        var sales = await _saleRepository.GetAllAsync();
        var commissions = await _commissionRepository.GetAllAsync();
        var products = await _productRepository.GetAllAsync();
        var dealers = await _dealerRepository.GetAllAsync();
        var users = await _userRepository.GetAllAsync();

        var thisMonth = DateTime.UtcNow.Date.AddDays(1 - DateTime.UtcNow.Day);
        var lastMonth = thisMonth.AddMonths(-1);

        var stats = new
        {
            TotalUsers = users.Count(),
            ActiveUsers = users.Count(u => u.IsActive),
            TotalDealers = dealers.Count(),
            ActiveDealers = dealers.Count(d => d.Status == "Active"),
            TotalProducts = products.Count(),
            LowStockProducts = products.Count(p => p.StockQuantity <= p.MinStockLevel && p.IsActive),
            ThisMonthSales = sales.Where(s => s.SaleDate >= thisMonth).Sum(s => s.TotalAmount),
            LastMonthSales = sales.Where(s => s.SaleDate >= lastMonth && s.SaleDate < thisMonth).Sum(s => s.TotalAmount),
            PendingCommissions = commissions.Where(c => c.PaymentStatus == "Pending").Sum(c => c.CommissionAmount),
            RecentSales = sales.OrderByDescending(s => s.SaleDate)
                .Take(5)
                .Select(s => new {
                    s.Id,
                    s.SaleNumber,
                    DealerName = s.Dealer?.BusinessName ?? "Unknown",
                    s.TotalAmount,
                    s.SaleDate
                })
        };

        return Ok(ApiResponse<object>.SuccessResult(stats));
    }

    [HttpGet("export/sales")]
    public async Task<ActionResult> ExportSales(
        [FromQuery] DateTime? fromDate, 
        [FromQuery] DateTime? toDate)
    {
        var sales = await _saleRepository.GetAllAsync();
        
        if (fromDate.HasValue) sales = sales.Where(s => s.SaleDate >= fromDate.Value);
        if (toDate.HasValue) sales = sales.Where(s => s.SaleDate <= toDate.Value);

        var csvData = _csvExportService.ExportSales(sales);
        return File(csvData, "text/csv", $"sales_{DateTime.UtcNow:yyyyMMdd}.csv");
    }

    [HttpGet("export/commissions")]
    public async Task<ActionResult> ExportCommissions(
        [FromQuery] DateTime? fromDate, 
        [FromQuery] DateTime? toDate)
    {
        var commissions = await _commissionRepository.GetAllAsync();
        
        if (fromDate.HasValue) commissions = commissions.Where(c => c.CommissionDate >= fromDate.Value);
        if (toDate.HasValue) commissions = commissions.Where(c => c.CommissionDate <= toDate.Value);

        var csvData = _csvExportService.ExportCommissions(commissions);
        return File(csvData, "text/csv", $"commissions_{DateTime.UtcNow:yyyyMMdd}.csv");
    }
}