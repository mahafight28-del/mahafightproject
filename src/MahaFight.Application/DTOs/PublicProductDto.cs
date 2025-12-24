namespace MahaFight.Application.DTOs;

public record PublicProductDto(
    Guid Id,
    string Name,
    decimal Price,
    string? Description,
    string Category,
    string? Brand,
    string? ImageUrl,
    bool InStock,
    IEnumerable<ProductImageDto> Images
);