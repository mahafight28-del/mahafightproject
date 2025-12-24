using MahaFight.Application.DTOs;
using MahaFight.Domain.Entities;
using MahaFight.Domain.Interfaces;

namespace MahaFight.Application.Services;

public class CustomerOrderService
{
    private readonly IRepository<Order> _orderRepository;
    private readonly IRepository<Product> _productRepository;
    private readonly IRepository<User> _userRepository;

    public CustomerOrderService(
        IRepository<Order> orderRepository,
        IRepository<Product> productRepository,
        IRepository<User> userRepository)
    {
        _orderRepository = orderRepository;
        _productRepository = productRepository;
        _userRepository = userRepository;
    }

    public async Task<CustomerOrderResponseDto> PlaceOrderAsync(Guid customerId, PlaceOrderRequest request)
    {
        var customer = await _userRepository.GetByIdAsync(customerId);
        if (customer == null)
            throw new ArgumentException("Customer not found");

        // Get products and calculate total
        var productIds = request.Items.Select(i => i.ProductId).ToList();
        var products = await _productRepository.GetByIdsAsync(productIds);
        
        decimal totalAmount = 0;
        var orderItems = new List<OrderItem>();

        foreach (var item in request.Items)
        {
            var product = products.FirstOrDefault(p => p.Id == item.ProductId);
            if (product == null)
                throw new ArgumentException($"Product {item.ProductId} not found");

            if (product.StockQuantity < item.Quantity)
                throw new ArgumentException($"Insufficient stock for {product.Name}");

            var itemTotal = product.UnitPrice * item.Quantity;
            totalAmount += itemTotal;

            orderItems.Add(new OrderItem
            {
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                UnitPrice = product.UnitPrice,
                TotalPrice = itemTotal
            });
        }

        // Create order
        var order = new Order
        {
            OrderNumber = GenerateOrderNumber(),
            CustomerId = customerId,
            OrderDate = DateTime.UtcNow,
            TotalAmount = totalAmount,
            Status = "Pending",
            ShippingAddress = request.ShippingAddress,
            City = request.City,
            State = request.State,
            PinCode = request.PinCode,
            Notes = request.Notes,
            CustomerPhone = customer.Phone,
            Items = orderItems
        };

        var createdOrder = await _orderRepository.AddAsync(order);

        // Update stock quantities
        foreach (var item in request.Items)
        {
            var product = products.First(p => p.Id == item.ProductId);
            product.StockQuantity -= item.Quantity;
            await _productRepository.UpdateAsync(product);
        }

        return MapToCustomerOrderDto(createdOrder, products);
    }

    public async Task<IEnumerable<CustomerOrderResponseDto>> GetCustomerOrdersAsync(Guid customerId)
    {
        var orders = await _orderRepository.GetByCustomerIdAsync(customerId);
        var result = new List<CustomerOrderResponseDto>();

        foreach (var order in orders)
        {
            var productIds = order.Items.Select(i => i.ProductId).ToList();
            var products = await _productRepository.GetByIdsAsync(productIds);
            result.Add(MapToCustomerOrderDto(order, products));
        }

        return result;
    }

    public async Task<CustomerOrderResponseDto?> GetCustomerOrderAsync(Guid customerId, Guid orderId)
    {
        var order = await _orderRepository.GetByIdAsync(orderId);
        if (order == null || order.CustomerId != customerId)
            return null;

        var productIds = order.Items.Select(i => i.ProductId).ToList();
        var products = await _productRepository.GetByIdsAsync(productIds);
        
        return MapToCustomerOrderDto(order, products);
    }

    private static CustomerOrderResponseDto MapToCustomerOrderDto(Order order, IEnumerable<Product> products)
    {
        var items = order.Items.Select(item =>
        {
            var product = products.First(p => p.Id == item.ProductId);
            return new CustomerOrderItemDto(
                item.ProductId,
                product.Name,
                item.Quantity,
                item.UnitPrice,
                item.TotalPrice
            );
        });

        return new CustomerOrderResponseDto(
            order.Id,
            order.OrderNumber,
            order.OrderDate,
            order.TotalAmount,
            order.Status,
            order.ShippingAddress,
            order.City,
            order.State,
            order.PinCode,
            order.Notes,
            items
        );
    }

    private static string GenerateOrderNumber()
    {
        return $"ORD-{DateTime.UtcNow:yyyyMMdd}-{new Random().Next(1000, 9999)}";
    }
}