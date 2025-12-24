using MahaFight.Application.Services;
using MahaFight.Domain.Entities;
using MahaFight.Domain.Interfaces;

namespace MahaFight.WebApi.Services;

public class CommissionProcessingService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<CommissionProcessingService> _logger;

    public CommissionProcessingService(IServiceProvider serviceProvider, ILogger<CommissionProcessingService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var saleRepository = scope.ServiceProvider.GetRequiredService<IRepository<Sale>>();
                var commissionRepository = scope.ServiceProvider.GetRequiredService<IRepository<Commission>>();
                var commissionService = scope.ServiceProvider.GetRequiredService<CommissionService>();

                var sales = await saleRepository.GetAllAsync();
                var commissions = await commissionRepository.GetAllAsync();
                
                var salesWithoutCommission = sales.Where(s => s.PaymentStatus == "Paid" && 
                    !commissions.Any(c => c.SaleId == s.Id));

                foreach (var sale in salesWithoutCommission)
                {
                    await commissionService.CalculateCommissionAsync(sale.DealerId, sale.Id, sale.TotalAmount);
                    _logger.LogInformation($"Commission calculated for sale {sale.SaleNumber}");
                }

                await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing commissions");
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }
    }
}