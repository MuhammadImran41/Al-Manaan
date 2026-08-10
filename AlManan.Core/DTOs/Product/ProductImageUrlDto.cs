namespace AlManan.Core.DTOs.Product;

public class ProductImageUrlDto
{
    public string ImageUrl  { get; set; } = string.Empty;
    public bool   IsMain    { get; set; } = true;
    public int    SortOrder { get; set; } = 1;
}
