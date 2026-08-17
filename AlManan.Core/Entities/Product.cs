namespace AlManan.Core.Entities;

/// <summary>
/// Product entity for Al-Manan clothing items
/// </summary>
public class Product : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ShortDescription { get; set; }
    public decimal Price { get; set; }
    public decimal? SalePrice { get; set; }
    public string SKU { get; set; } = string.Empty;
    public int StockQuantity { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; } = false;
    public bool IsBestSeller { get; set; } = false;
    public bool IsNew { get; set; } = true;
    public string? Fabric { get; set; }
    public string? Care { get; set; }
    public string StitchType { get; set; } = "Unstitched"; // Stitched / Unstitched / Both
    public double AverageRating { get; set; } = 0;
    public int ReviewCount { get; set; } = 0;

    // Foreign keys
    public int CategoryId { get; set; }

    // Navigation properties
    public Category? Category { get; set; }
    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
    public ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public ICollection<WishlistItem> WishlistItems { get; set; } = new List<WishlistItem>();
    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}
