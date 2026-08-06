using System.ComponentModel.DataAnnotations;

namespace AlManan.Core.DTOs.Order;

public class OrderDto
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal SubTotal { get; set; }
    public decimal ShippingCost { get; set; }
    public decimal Discount { get; set; }
    public decimal TotalAmount { get; set; }
    public string PaymentStatus { get; set; } = string.Empty;
    public string? PaymentMethod { get; set; }
    public string? TrackingNumber { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ShippedAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();
    public ShippingAddressDto? ShippingAddress { get; set; }
}

public class OrderItemDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? ProductImageUrl { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal SubTotal { get; set; }
    public string Size { get; set; } = string.Empty;
    public string? Color { get; set; }
}

public class CreateOrderDto
{
    [Required]
    public ShippingAddressDto ShippingAddress { get; set; } = new();

    [Required]
    public string PaymentMethod { get; set; } = string.Empty;

    public string? Notes { get; set; }
}

public class ShippingAddressDto
{
    [Required]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [Phone]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required]
    public string Street { get; set; } = string.Empty;

    [Required]
    public string City { get; set; } = string.Empty;

    [Required]
    public string Province { get; set; } = string.Empty;

    [Required]
    public string PostalCode { get; set; } = string.Empty;

    public string Country { get; set; } = "Pakistan";
}

public class UpdateOrderStatusDto
{
    [Required]
    public string Status { get; set; } = string.Empty;
    public string? TrackingNumber { get; set; }
}
