namespace AlManan.Core.Entities;

/// <summary>
/// Customer review for a product
/// </summary>
public class Review : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public int ProductId { get; set; }
    public int Rating { get; set; }  // 1-5
    public string? Title { get; set; }
    public string? Comment { get; set; }
    public bool IsApproved { get; set; } = false;

    public AppUser? User { get; set; }
    public Product? Product { get; set; }
}
