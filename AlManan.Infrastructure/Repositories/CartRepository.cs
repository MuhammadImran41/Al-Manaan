using AlManan.Core.Entities;
using AlManan.Core.Interfaces;
using AlManan.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AlManan.Infrastructure.Repositories;

/// <summary>
/// Cart repository managing user baskets
/// </summary>
public class CartRepository : ICartRepository
{
    private readonly AppDbContext _context;

    public CartRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<CartBasket?> GetCartAsync(string userId)
        => await _context.CartBaskets
            .Include(c => c.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p!.Images.Where(img => img.IsMain))
            .FirstOrDefaultAsync(c => c.UserId == userId);

    public async Task<CartBasket> GetOrCreateCartAsync(string userId)
    {
        var cart = await GetCartAsync(userId);
        if (cart != null) return cart;

        cart = new CartBasket { UserId = userId };
        await _context.CartBaskets.AddAsync(cart);
        await _context.SaveChangesAsync();
        return cart;
    }

    public async Task<CartItem?> AddItemToCartAsync(string userId, int productId, int quantity, string size, string? color)
    {
        var cart = await GetOrCreateCartAsync(userId);

        // Check if item already exists with same size/color
        var existingItem = cart.Items.FirstOrDefault(i =>
            i.ProductId == productId &&
            i.Size == size &&
            i.Color == color);

        if (existingItem != null)
        {
            existingItem.Quantity += quantity;
            existingItem.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            existingItem = new CartItem
            {
                CartId = cart.Id,
                ProductId = productId,
                Quantity = quantity,
                Size = size,
                Color = color
            };
            await _context.CartItems.AddAsync(existingItem);
        }

        await _context.SaveChangesAsync();
        return existingItem;
    }

    public async Task<bool> RemoveItemFromCartAsync(string userId, int cartItemId)
    {
        var cart = await _context.CartBaskets
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null) return false;

        var item = cart.Items.FirstOrDefault(i => i.Id == cartItemId);
        if (item == null) return false;

        _context.CartItems.Remove(item);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> UpdateCartItemQuantityAsync(string userId, int cartItemId, int quantity)
    {
        var cart = await _context.CartBaskets
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null) return false;

        var item = cart.Items.FirstOrDefault(i => i.Id == cartItemId);
        if (item == null) return false;

        item.Quantity = quantity;
        item.UpdatedAt = DateTime.UtcNow;
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> ClearCartAsync(string userId)
    {
        var cart = await _context.CartBaskets
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null) return false;

        _context.CartItems.RemoveRange(cart.Items);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<int> GetCartItemCountAsync(string userId)
    {
        var cart = await _context.CartBaskets
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        return cart?.Items.Sum(i => i.Quantity) ?? 0;
    }
}
