namespace AlManan.Core.Entities;

/// <summary>
/// Order entity representing a customer purchase
/// </summary>
public class Order : BaseEntity
{
    public string OrderNumber { get; set; } = string.Empty;
    public string? UserId { get; set; }  // Nullable — guest orders have no user
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public decimal SubTotal { get; set; }
    public decimal ShippingCost { get; set; }
    public decimal Discount { get; set; }
    public decimal TotalAmount { get; set; }
    public string? Notes { get; set; }
    public string? TrackingNumber { get; set; }
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;
    public string? PaymentMethod { get; set; }
    public string? PaymentIntentId { get; set; }
    public DateTime? ShippedAt { get; set; }
    public DateTime? DeliveredAt { get; set; }

    // Navigation properties
    public AppUser? User { get; set; }
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public ShippingAddress? ShippingAddress { get; set; }
}

public enum OrderStatus
{
    Pending = 0,
    Confirmed = 1,
    Processing = 2,
    Shipped = 3,
    Delivered = 4,
    Cancelled = 5,
    Refunded = 6
}

public enum PaymentStatus
{
    Pending = 0,
    Paid = 1,
    Failed = 2,
    Refunded = 3,
    PartiallyRefunded = 4
}
