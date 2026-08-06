namespace AlManan.Core.Entities;

/// <summary>
/// Individual line item within an order
/// </summary>
public class OrderItem : BaseEntity
{
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal SubTotal { get; set; }
    public string Size { get; set; } = string.Empty;
    public string? Color { get; set; }
    public string ProductName { get; set; } = string.Empty;  // Snapshot at time of order
    public string? ProductImageUrl { get; set; }

    // Foreign keys
    public int OrderId { get; set; }
    public int ProductId { get; set; }

    public Order? Order { get; set; }
    public Product? Product { get; set; }
}
