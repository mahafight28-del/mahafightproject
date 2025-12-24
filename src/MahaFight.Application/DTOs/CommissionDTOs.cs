using FluentValidation;

namespace MahaFight.Application.DTOs;

public record CommissionDto(
    Guid Id,
    Guid DealerId,
    string DealerName,
    Guid SaleId,
    string SaleNumber,
    decimal CommissionRate,
    decimal SaleAmount,
    decimal CommissionAmount,
    DateTime CommissionDate,
    string PaymentStatus,
    DateTime? PaidDate,
    string? PaymentReference
);

public record CommissionReportDto(
    Guid DealerId,
    string DealerName,
    decimal TotalSales,
    decimal TotalCommission,
    decimal PendingCommission,
    decimal PaidCommission,
    int TotalSalesCount,
    DateTime ReportDate
);

public record CommissionFilterRequest(
    DateTime? FromDate = null,
    DateTime? ToDate = null,
    Guid? DealerId = null,
    string? PaymentStatus = null
);

public record MarkCommissionPaidRequest(
    Guid CommissionId,
    string PaymentReference,
    DateTime? PaidDate = null
);

public class MarkCommissionPaidValidator : AbstractValidator<MarkCommissionPaidRequest>
{
    public MarkCommissionPaidValidator()
    {
        RuleFor(x => x.CommissionId).NotEmpty();
        RuleFor(x => x.PaymentReference).NotEmpty().MaximumLength(100);
    }
}