namespace AlManan.Core.Entities;

/// <summary>
/// Product variant for size and color combinations
/// </summary>
public class ProductVariant : BaseEntity
{
    public string Size { get; set; } = string.Empty;  // XS, S, M, L, XL, XXL
    public string? Color { get; set; }
    public string? ColorHex { get; set; }
    public int StockQuantity { get; set; }
    public decimal? PriceAdjustment { get; set; } = 0;
    public string SKU { get; set; } = string.Empty;

    // Foreign key
    public int ProductId { get; set; }
    public Product? Product { get; set; }
}
