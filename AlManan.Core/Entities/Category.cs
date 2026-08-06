namespace AlManan.Core.Entities;

/// <summary>
/// Product category entity supporting Men/Women and sub-categories
/// </summary>
public class Category : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public GenderType Gender { get; set; } = GenderType.Unisex;
    public bool IsActive { get; set; } = true;
    public int? ParentCategoryId { get; set; }
    public int SortOrder { get; set; } = 0;

    // Navigation properties
    public Category? ParentCategory { get; set; }
    public ICollection<Category> SubCategories { get; set; } = new List<Category>();
    public ICollection<Product> Products { get; set; } = new List<Product>();
}

public enum GenderType
{
    Men = 0,
    Women = 1,
    Unisex = 2,
    Kids = 3
}
