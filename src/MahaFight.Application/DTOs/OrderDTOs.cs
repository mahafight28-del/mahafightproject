namespace MahaFight.Application.DTOs;

public record CreateOrderRequest(
    string ShippingAddress,
    string CustomerPhone
);

public record OrderDto(
    Guid Id,
    string OrderNumber,
    decimal TotalAmount,
    string Status,
    string PaymentMethod,
    string PaymentStatus,
    string ShippingAddress,
    DateTime OrderDate,
    List<OrderItemDto> Items
);

public record OrderItemDto(
    Guid ProductId,
    string ProductName,
    int Quantity,
    decimal UnitPrice,
    decimal TotalPrice
);

public record CustomerRegisterRequest(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string Phone,
    string? Address,
    string? City,
    string? State,
    string? PinCode
);