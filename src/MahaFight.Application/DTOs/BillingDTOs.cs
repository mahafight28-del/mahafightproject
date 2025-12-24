using FluentValidation;

namespace MahaFight.Application.DTOs;

public record CreateSaleRequest(
    Guid DealerId,
    string? CustomerName,
    string? CustomerEmail,
    string? CustomerPhone,
    string? PaymentMethod,
    List<SaleItemRequest> Items
);

public record SaleItemRequest(
    Guid ProductId,
    int Quantity,
    decimal? UnitPrice = null
);

public record SaleResponseDto(
    Guid Id,
    string SaleNumber,
    Guid DealerId,
    string? CustomerName,
    DateTime SaleDate,
    decimal Subtotal,
    decimal TaxAmount,
    decimal TotalAmount,
    string PaymentStatus,
    List<SaleItemDto> Items
);

public record SaleItemDto(
    Guid ProductId,
    string ProductName,
    int Quantity,
    decimal UnitPrice,
    decimal LineTotal
);

public record InvoiceResponseDto(
    Guid Id,
    string InvoiceNumber,
    Guid SaleId,
    string DealerName,
    DateTime InvoiceDate,
    DateTime DueDate,
    decimal TotalAmount,
    decimal PaidAmount,
    decimal BalanceAmount,
    string Status
);

public record CreateInvoiceRequest(
    Guid SaleId,
    DateTime DueDate,
    string? PaymentTerms
);

public class CreateSaleValidator : AbstractValidator<CreateSaleRequest>
{
    public CreateSaleValidator()
    {
        RuleFor(x => x.DealerId).NotEmpty();
        RuleFor(x => x.Items).NotEmpty().Must(x => x.Count > 0);
        RuleForEach(x => x.Items).SetValidator(new SaleItemValidator());
    }
}

public record UpdateInvoiceStatusRequest(
    string Status,
    decimal? PaidAmount = null
);

public class SaleItemValidator : AbstractValidator<SaleItemRequest>
{
    public SaleItemValidator()
    {
        RuleFor(x => x.ProductId).NotEmpty();
        RuleFor(x => x.Quantity).GreaterThan(0);
        RuleFor(x => x.UnitPrice).GreaterThan(0).When(x => x.UnitPrice.HasValue);
    }
}