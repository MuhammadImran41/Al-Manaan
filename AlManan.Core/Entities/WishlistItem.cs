namespace AlManan.Core.Entities;

/// <summary>
/// Wishlist item saved by a user
/// </summary>
public class WishlistItem : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public int ProductId { get; set; }

    public AppUser? User { get; set; }
    public Product? Product { get; set; }
}
