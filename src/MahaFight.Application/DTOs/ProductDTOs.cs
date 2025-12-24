using Microsoft.AspNetCore.Http;
using FluentValidation;

namespace MahaFight.Application.DTOs;

public record CreateProductRequest(
    string Name,
    string Sku,
    string? Description,
    string Category,
    string? Brand,
    decimal UnitPrice,
    decimal CostPrice,
    int StockQuantity,
    int? MinStockLevel,
    decimal? Weight,
    string? Dimensions
);

public record UpdateProductRequest(
    Guid Id,
    string Name,
    string Sku,
    string? Description,
    string Category,
    string? Brand,
    decimal UnitPrice,
    decimal CostPrice,
    int StockQuantity,
    int? MinStockLevel,
    decimal? Weight,
    string? Dimensions
);

public record ProductResponseDto(
    Guid Id,
    string Name,
    decimal Price,
    decimal CommissionPercentage,
    string? Description,
    string Category,
    string? Brand,
    string? ImageUrl,
    string? QrCodeUrl,
    bool IsActive,
    DateTime CreatedAt,
    string? Sku,
    decimal CostPrice,
    int StockQuantity,
    int MinStockLevel,
    decimal? Weight,
    string? Dimensions,
    IEnumerable<ProductImageDto> Images
);

public class CreateProductValidator : AbstractValidator<CreateProductRequest>
{
    public CreateProductValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Sku).NotEmpty().MaximumLength(50);
        RuleFor(x => x.UnitPrice).GreaterThan(0);
        RuleFor(x => x.CostPrice).GreaterThan(0);
        RuleFor(x => x.Category).NotEmpty().MaximumLength(50);
        RuleFor(x => x.StockQuantity).GreaterThanOrEqualTo(0);
    }
}