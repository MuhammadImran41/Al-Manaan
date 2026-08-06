namespace AlManan.Core.Helpers;

/// <summary>
/// Query params for product filtering and sorting
/// </summary>
public class ProductQueryParams : PaginationParams
{
    public int? CategoryId { get; set; }
    public string? Gender { get; set; }  // "men", "women", "unisex"
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public string? Size { get; set; }
    public string? Color { get; set; }
    public string? SortBy { get; set; }  // "price_asc", "price_desc", "newest", "popular"
    public string? Search { get; set; }
    public bool? IsFeatured { get; set; }
    public bool? IsBestSeller { get; set; }
    public bool? IsNew { get; set; }
}
