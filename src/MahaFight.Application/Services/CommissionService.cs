using MahaFight.Application.DTOs;
using MahaFight.Domain.Entities;
using MahaFight.Domain.Interfaces;

namespace MahaFight.Application.Services;

public class CommissionService
{
    private readonly IRepository<Commission> _commissionRepository;
    private readonly IRepository<Dealer> _dealerRepository;
    private readonly IRepository<Sale> _saleRepository;

    public CommissionService(
        IRepository<Commission> commissionRepository,
        IRepository<Dealer> dealerRepository,
        IRepository<Sale> saleRepository)
    {
        _commissionRepository = commissionRepository;
        _dealerRepository = dealerRepository;
        _saleRepository = saleRepository;
    }

    public async Task<Commission> CalculateCommissionAsync(Guid dealerId, Guid saleId, decimal saleAmount)
    {
        var dealer = await _dealerRepository.GetByIdAsync(dealerId);
        if (dealer == null) throw new ArgumentException("Dealer not found");

        var commissionAmount = saleAmount * (dealer.CommissionRate / 100);

        var commission = new Commission
        {
            DealerId = dealerId,
            SaleId = saleId,
            CommissionRate = dealer.CommissionRate,
            SaleAmount = saleAmount,
            CommissionAmount = commissionAmount,
            PaymentStatus = "Pending"
        };

        return await _commissionRepository.AddAsync(commission);
    }

    public async Task<IEnumerable<CommissionDto>> GetDealerCommissionsAsync(Guid dealerId)
    {
        var commissions = await _commissionRepository.GetAllAsync();
        var dealers = await _dealerRepository.GetAllAsync();
        var sales = await _saleRepository.GetAllAsync();

        return commissions.Where(c => c.DealerId == dealerId)
            .Select(c => MapToDto(c, dealers, sales));
    }

    public async Task<IEnumerable<CommissionDto>> GetAllCommissionsAsync(CommissionFilterRequest? filter = null)
    {
        var commissions = await _commissionRepository.GetAllAsync();
        var dealers = await _dealerRepository.GetAllAsync();
        var sales = await _saleRepository.GetAllAsync();

        var query = commissions.AsEnumerable();

        if (filter != null)
        {
            if (filter.DealerId.HasValue)
                query = query.Where(c => c.DealerId == filter.DealerId.Value);
            
            if (!string.IsNullOrEmpty(filter.PaymentStatus))
                query = query.Where(c => c.PaymentStatus == filter.PaymentStatus);
            
            if (filter.FromDate.HasValue)
                query = query.Where(c => c.CommissionDate >= filter.FromDate.Value);
            
            if (filter.ToDate.HasValue)
                query = query.Where(c => c.CommissionDate <= filter.ToDate.Value);
        }

        return query.Select(c => MapToDto(c, dealers, sales));
    }

    public async Task<CommissionDto?> GetCommissionByIdAsync(Guid id)
    {
        var commission = await _commissionRepository.GetByIdAsync(id);
        if (commission == null) return null;
        
        var dealers = await _dealerRepository.GetAllAsync();
        var sales = await _saleRepository.GetAllAsync();
        
        return MapToDto(commission, dealers, sales);
    }

    public async Task<bool> MarkCommissionAsPaidAsync(MarkCommissionPaidRequest request)
    {
        var commission = await _commissionRepository.GetByIdAsync(request.CommissionId);
        if (commission == null) return false;

        commission.PaymentStatus = "Paid";
        commission.PaidDate = request.PaidDate ?? DateTime.UtcNow;
        commission.PaymentReference = request.PaymentReference;
        commission.UpdatedAt = DateTime.UtcNow;

        await _commissionRepository.UpdateAsync(commission);
        return true;
    }

    public async Task<CommissionReportDto> GetDealerCommissionReportAsync(Guid dealerId)
    {
        var commissions = await _commissionRepository.GetAllAsync();
        var dealer = await _dealerRepository.GetByIdAsync(dealerId);
        
        if (dealer == null)
            throw new ArgumentException("Dealer not found");

        var dealerCommissions = commissions.Where(c => c.DealerId == dealerId).ToList();

        var totalSales = dealerCommissions.Sum(c => c.SaleAmount);
        var totalCommission = dealerCommissions.Sum(c => c.CommissionAmount);
        var pendingCommission = dealerCommissions.Where(c => c.PaymentStatus == "Pending").Sum(c => c.CommissionAmount);
        var paidCommission = dealerCommissions.Where(c => c.PaymentStatus == "Paid").Sum(c => c.CommissionAmount);

        return new CommissionReportDto(
            dealerId,
            dealer.BusinessName,
            totalSales,
            totalCommission,
            pendingCommission,
            paidCommission,
            dealerCommissions.Count,
            DateTime.UtcNow
        );
    }

    public async Task<IEnumerable<CommissionReportDto>> GetAllDealersCommissionReportAsync()
    {
        var dealers = await _dealerRepository.GetAllAsync();
        var reports = new List<CommissionReportDto>();

        foreach (var dealer in dealers)
        {
            var report = await GetDealerCommissionReportAsync(dealer.Id);
            reports.Add(report);
        }

        return reports;
    }

    private static CommissionDto MapToDto(
        Commission commission,
        IEnumerable<Dealer> dealers,
        IEnumerable<Sale> sales)
    {
        var dealer = dealers.FirstOrDefault(d => d.Id == commission.DealerId);
        var sale = sales.FirstOrDefault(s => s.Id == commission.SaleId);

        return new CommissionDto(
            commission.Id,
            commission.DealerId,
            dealer?.BusinessName ?? "Unknown",
            commission.SaleId,
            sale?.SaleNumber ?? "Unknown",
            commission.CommissionRate,
            commission.SaleAmount,
            commission.CommissionAmount,
            commission.CommissionDate,
            commission.PaymentStatus,
            commission.PaidDate,
            commission.PaymentReference
        );
    }
}