namespace AlManan.Core.Entities;

/// <summary>
/// Product image entity supporting multiple images per product
/// </summary>
public class ProductImage : BaseEntity
{
    public string ImageUrl { get; set; } = string.Empty;
    public string? PublicId { get; set; }  // Cloudinary public ID
    public bool IsMain { get; set; } = false;
    public int SortOrder { get; set; } = 0;
    public string? AltText { get; set; }

    // Foreign key
    public int ProductId { get; set; }
    public Product? Product { get; set; }
}
