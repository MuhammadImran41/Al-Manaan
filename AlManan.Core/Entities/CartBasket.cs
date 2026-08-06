namespace AlManan.Core.Entities;

/// <summary>
/// Shopping cart/basket entity for a user
/// </summary>
public class CartBasket : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public string? CouponCode { get; set; }
    public decimal? DiscountAmount { get; set; }

    // Navigation properties
    public AppUser? User { get; set; }
    public ICollection<CartItem> Items { get; set; } = new List<CartItem>();
}

/// <summary>
/// Individual item in a cart
/// </summary>
public class CartItem : BaseEntity
{
    public int CartId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public string Size { get; set; } = string.Empty;
    public string? Color { get; set; }

    public CartBasket? Cart { get; set; }
    public Product? Product { get; set; }
}
