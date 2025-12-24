namespace MahaFight.Application.DTOs;

public record AddToCartRequest(Guid ProductId, int Quantity);

public record UpdateCartItemRequest(int Quantity);

public record CartDto(
    Guid Id,
    List<CartItemDto> Items,
    decimal TotalAmount
);

public record CartItemDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    decimal Price,
    int Quantity,
    decimal Total
);