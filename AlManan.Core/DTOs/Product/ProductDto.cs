using System.ComponentModel.DataAnnotations;

namespace AlManan.Core.DTOs.Product;

public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ShortDescription { get; set; }
    public decimal Price { get; set; }
    public decimal? SalePrice { get; set; }
    public string SKU { get; set; } = string.Empty;
    public int StockQuantity { get; set; }
    public bool IsActive { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsBestSeller { get; set; }
    public bool IsNew { get; set; }
    public string? Fabric { get; set; }
    public string? Care { get; set; }
    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string? GenderType { get; set; }
    public string? MainImageUrl { get; set; }
    public List<ProductImageDto> Images { get; set; } = new();
    public List<ProductVariantDto> Variants { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

public class ProductCreateDto
{
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    public string? ShortDescription { get; set; }

    [Required]
    [Range(0.01, 99999)]
    public decimal Price { get; set; }

    [Range(0, 99999)]
    public decimal? SalePrice { get; set; }

    [Required]
    public string SKU { get; set; } = string.Empty;

    [Range(0, 9999)]
    public int StockQuantity { get; set; }

    public bool IsFeatured { get; set; }
    public bool IsBestSeller { get; set; }
    public bool IsNew { get; set; } = true;
    public string? Fabric { get; set; }
    public string? Care { get; set; }

    [Required]
    public int CategoryId { get; set; }

    public List<ProductVariantCreateDto> Variants { get; set; } = new();
}

public class ProductUpdateDto : ProductCreateDto
{
    public bool IsActive { get; set; }
}

public class ProductImageDto
{
    public int Id { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsMain { get; set; }
    public int SortOrder { get; set; }
    public string? AltText { get; set; }
}

public class ProductVariantDto
{
    public int Id { get; set; }
    public string Size { get; set; } = string.Empty;
    public string? Color { get; set; }
    public string? ColorHex { get; set; }
    public int StockQuantity { get; set; }
    public decimal? PriceAdjustment { get; set; }
    public string SKU { get; set; } = string.Empty;
}

public class ProductVariantCreateDto
{
    [Required]
    public string Size { get; set; } = string.Empty;
    public string? Color { get; set; }
    public string? ColorHex { get; set; }

    [Range(0, 9999)]
    public int StockQuantity { get; set; }
    public decimal? PriceAdjustment { get; set; }
    public string SKU { get; set; } = string.Empty;
}
