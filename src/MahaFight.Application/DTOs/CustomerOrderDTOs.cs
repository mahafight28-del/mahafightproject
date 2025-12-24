namespace MahaFight.Application.DTOs;

public record PlaceOrderRequest(
    IEnumerable<OrderItemRequest> Items,
    string ShippingAddress,
    string City,
    string State,
    string PinCode,
    string? Notes
);

public record OrderItemRequest(
    Guid ProductId,
    int Quantity
);

public record CustomerOrderResponseDto(
    Guid Id,
    string OrderNumber,
    DateTime OrderDate,
    decimal TotalAmount,
    string Status,
    string ShippingAddress,
    string City,
    string State,
    string PinCode,
    string? Notes,
    IEnumerable<CustomerOrderItemDto> Items
);

public record CustomerOrderItemDto(
    Guid ProductId,
    string ProductName,
    int Quantity,
    decimal UnitPrice,
    decimal TotalPrice
);