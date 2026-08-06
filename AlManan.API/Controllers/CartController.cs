using System.Security.Claims;
using AlManan.Core.DTOs.Cart;
using AlManan.Core.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AlManan.API.Controllers;

/// <summary>
/// Shopping cart management controller
/// </summary>
[Authorize]
public class CartController : BaseApiController
{
    private readonly ICartRepository _cartRepo;
    private readonly IMapper _mapper;

    public CartController(ICartRepository cartRepo, IMapper mapper)
    {
        _cartRepo = cartRepo;
        _mapper = mapper;
    }

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    /// <summary>Get current user's cart</summary>
    [HttpGet]
    public async Task<ActionResult<CartDto>> GetCart()
    {
        var cart = await _cartRepo.GetOrCreateCartAsync(UserId);
        return Ok(_mapper.Map<CartDto>(cart));
    }

    /// <summary>Add item to cart</summary>
    [HttpPost("items")]
    public async Task<ActionResult<CartDto>> AddToCart([FromBody] AddToCartDto dto)
    {
        await _cartRepo.AddItemToCartAsync(UserId, dto.ProductId, dto.Quantity, dto.Size, dto.Color);
        var cart = await _cartRepo.GetCartAsync(UserId);
        return Ok(_mapper.Map<CartDto>(cart));
    }

    /// <summary>Update cart item quantity</summary>
    [HttpPut("items/{itemId:int}")]
    public async Task<ActionResult<CartDto>> UpdateCartItem(int itemId, [FromBody] UpdateCartItemDto dto)
    {
        var updated = await _cartRepo.UpdateCartItemQuantityAsync(UserId, itemId, dto.Quantity);
        if (!updated) return NotFound(new { message = "Cart item not found" });

        var cart = await _cartRepo.GetCartAsync(UserId);
        return Ok(_mapper.Map<CartDto>(cart));
    }

    /// <summary>Remove item from cart</summary>
    [HttpDelete("items/{itemId:int}")]
    public async Task<ActionResult<CartDto>> RemoveFromCart(int itemId)
    {
        var removed = await _cartRepo.RemoveItemFromCartAsync(UserId, itemId);
        if (!removed) return NotFound(new { message = "Cart item not found" });

        var cart = await _cartRepo.GetCartAsync(UserId);
        return Ok(_mapper.Map<CartDto>(cart));
    }

    /// <summary>Clear all items from cart</summary>
    [HttpDelete]
    public async Task<ActionResult> ClearCart()
    {
        await _cartRepo.ClearCartAsync(UserId);
        return NoContent();
    }

    /// <summary>Get number of items in cart (for cart badge)</summary>
    [HttpGet("count")]
    public async Task<ActionResult<int>> GetCartCount()
    {
        var count = await _cartRepo.GetCartItemCountAsync(UserId);
        return Ok(count);
    }
}
