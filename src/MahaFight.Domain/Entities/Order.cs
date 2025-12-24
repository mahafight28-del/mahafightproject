namespace MahaFight.Domain.Entities;

public class Order : BaseEntity
{
    public string OrderNumber { get; set; } = null!;
    public Guid CustomerId { get; set; }
    public Guid? AssignedDealerId { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Assigned, Shipped, Delivered, Cancelled
    public string PaymentMethod { get; set; } = "COD";
    public string PaymentStatus { get; set; } = "Pending";
    public string ShippingAddress { get; set; } = null!;
    public string City { get; set; } = null!;
    public string State { get; set; } = null!;
    public string PinCode { get; set; } = null!;
    public string? Notes { get; set; }
    public string CustomerPhone { get; set; } = null!;
    public DateTime OrderDate { get; set; }
    
    public User Customer { get; set; } = null!;
    public Dealer? AssignedDealer { get; set; }
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}