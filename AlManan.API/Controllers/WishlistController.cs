using System.Security.Claims;
using AlManan.Core.DTOs.Product;
using AlManan.Core.Entities;
using AlManan.Core.Interfaces;
using AlManan.Infrastructure.Data;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AlManan.API.Controllers;

/// <summary>
/// Wishlist management controller
/// </summary>
[Authorize]
public class WishlistController : BaseApiController
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public WishlistController(AppDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    /// <summary>Get current user's wishlist</summary>
    [HttpGet]
    public async Task<ActionResult<List<ProductDto>>> GetWishlist()
    {
        var items = await _context.WishlistItems
            .Include(w => w.Product)
                .ThenInclude(p => p!.Images.Where(i => i.IsMain))
            .Include(w => w.Product)
                .ThenInclude(p => p!.Category)
            .Where(w => w.UserId == UserId)
            .ToListAsync();

        var products = items.Select(w => w.Product).Where(p => p != null).ToList();
        return Ok(_mapper.Map<List<ProductDto>>(products));
    }

    /// <summary>Add product to wishlist</summary>
    [HttpPost("{productId:int}")]
    public async Task<ActionResult> AddToWishlist(int productId)
    {
        var exists = await _context.WishlistItems
            .AnyAsync(w => w.UserId == UserId && w.ProductId == productId);

        if (exists) return BadRequest(new { message = "Product already in wishlist" });

        var product = await _context.Products.FindAsync(productId);
        if (product == null) return NotFound(new { message = "Product not found" });

        await _context.WishlistItems.AddAsync(new WishlistItem
        {
            UserId = UserId,
            ProductId = productId
        });
        await _context.SaveChangesAsync();

        return Ok(new { message = "Added to wishlist" });
    }

    /// <summary>Remove product from wishlist</summary>
    [HttpDelete("{productId:int}")]
    public async Task<ActionResult> RemoveFromWishlist(int productId)
    {
        var item = await _context.WishlistItems
            .FirstOrDefaultAsync(w => w.UserId == UserId && w.ProductId == productId);

        if (item == null) return NotFound(new { message = "Item not found in wishlist" });

        _context.WishlistItems.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>Check if product is in wishlist</summary>
    [HttpGet("{productId:int}/check")]
    public async Task<ActionResult<bool>> CheckWishlist(int productId)
    {
        var exists = await _context.WishlistItems
            .AnyAsync(w => w.UserId == UserId && w.ProductId == productId);
        return Ok(exists);
    }
}
