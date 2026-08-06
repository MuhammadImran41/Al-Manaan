using System.ComponentModel.DataAnnotations;

namespace AlManan.Core.DTOs.Cart;

public class CartDto
{
    public int Id { get; set; }
    public List<CartItemDto> Items { get; set; } = new();
    public decimal SubTotal { get; set; }
    public decimal? DiscountAmount { get; set; }
    public string? CouponCode { get; set; }
    public int TotalItems { get; set; }
}

public class CartItemDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? ProductImageUrl { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal? SalePrice { get; set; }
    public int Quantity { get; set; }
    public string Size { get; set; } = string.Empty;
    public string? Color { get; set; }
    public decimal SubTotal { get; set; }
    public int AvailableStock { get; set; }
}

public class AddToCartDto
{
    [Required]
    public int ProductId { get; set; }

    [Required]
    [Range(1, 99)]
    public int Quantity { get; set; }

    [Required]
    public string Size { get; set; } = string.Empty;

    public string? Color { get; set; }
}

public class UpdateCartItemDto
{
    [Required]
    [Range(1, 99)]
    public int Quantity { get; set; }
}
