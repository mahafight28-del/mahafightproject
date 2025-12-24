namespace MahaFight.Application.DTOs;

public record ProductDto(
    Guid Id,
    string Sku,
    string Name,
    string? Description,
    string Category,
    string? Brand,
    decimal UnitPrice,
    decimal CostPrice,
    int StockQuantity,
    bool IsActive
);