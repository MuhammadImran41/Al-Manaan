using AlManan.Core.Entities;

namespace AlManan.Core.Interfaces;

/// <summary>
/// Cart/basket repository interface
/// </summary>
public interface ICartRepository
{
    Task<CartBasket?> GetCartAsync(string userId);
    Task<CartBasket> GetOrCreateCartAsync(string userId);
    Task<CartItem?> AddItemToCartAsync(string userId, int productId, int quantity, string size, string? color);
    Task<bool> RemoveItemFromCartAsync(string userId, int cartItemId);
    Task<bool> UpdateCartItemQuantityAsync(string userId, int cartItemId, int quantity);
    Task<bool> ClearCartAsync(string userId);
    Task<int> GetCartItemCountAsync(string userId);
}
