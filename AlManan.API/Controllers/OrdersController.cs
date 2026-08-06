using System.Security.Claims;
using AlManan.Core.DTOs.Order;
using AlManan.Core.Entities;
using AlManan.Core.Helpers;
using AlManan.Core.Interfaces;
using AlManan.Infrastructure.Data;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AlManan.API.Controllers;

[Authorize]
public class OrdersController : BaseApiController
{
    private readonly IOrderRepository _orderRepo;
    private readonly ICartRepository  _cartRepo;
    private readonly IMapper          _mapper;
    private readonly AppDbContext     _context;
    private readonly IEmailService    _emailService;

    public OrdersController(
        IOrderRepository orderRepo,
        ICartRepository  cartRepo,
        IMapper          mapper,
        AppDbContext      context,
        IEmailService    emailService)
    {
        _orderRepo    = orderRepo;
        _cartRepo     = cartRepo;
        _mapper       = mapper;
        _context      = context;
        _emailService = emailService;
    }

    private string UserId    => User.FindFirstValue(ClaimTypes.NameIdentifier)!;
    private string UserEmail => User.FindFirstValue(ClaimTypes.Email) ?? string.Empty;

    // Old constructor removed — replaced above

    /// <summary>Create a new order from current cart</summary>
    [HttpPost]
    public async Task<ActionResult<OrderDto>> CreateOrder([FromBody] CreateOrderDto dto)
    {
        var cart = await _cartRepo.GetCartAsync(UserId);
        if (cart == null || !cart.Items.Any())
            return BadRequest(new { message = "Cart is empty" });

        // Build order from cart
        var order = new Order
        {
            UserId = UserId,
            OrderNumber = _orderRepo.GenerateOrderNumber(),
            PaymentMethod = dto.PaymentMethod,
            Notes = dto.Notes,
            ShippingCost = 200,  // Fixed shipping cost (PKR)
            Discount = cart.DiscountAmount ?? 0
        };

        // Map order items from cart
        foreach (var cartItem in cart.Items)
        {
            var unitPrice = cartItem.Product?.SalePrice ?? cartItem.Product?.Price ?? 0;
            var item = new OrderItem
            {
                ProductId = cartItem.ProductId,
                ProductName = cartItem.Product?.Name ?? string.Empty,
                ProductImageUrl = cartItem.Product?.Images.FirstOrDefault(i => i.IsMain)?.ImageUrl,
                Quantity = cartItem.Quantity,
                Size = cartItem.Size,
                Color = cartItem.Color,
                UnitPrice = unitPrice,
                SubTotal = unitPrice * cartItem.Quantity
            };
            order.OrderItems.Add(item);
        }

        order.SubTotal = order.OrderItems.Sum(i => i.SubTotal);
        order.TotalAmount = order.SubTotal + order.ShippingCost - order.Discount;

        // Set shipping address
        order.ShippingAddress = _mapper.Map<ShippingAddress>(dto.ShippingAddress);

        await _orderRepo.AddAsync(order);
        await _orderRepo.SaveChangesAsync();

        // Auto-create or update BuyerProfile
        await UpsertBuyerProfile(order, dto.ShippingAddress);

        // Clear the cart after order
        await _cartRepo.ClearCartAsync(UserId);

        var createdOrder = await _orderRepo.GetOrderWithDetailsAsync(order.Id);

        // Send emails (fire-and-forget — don't block response)
        _ = SendOrderEmailsAsync(createdOrder!, dto.ShippingAddress);

        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, _mapper.Map<OrderDto>(createdOrder));
    }

    /// <summary>Get current user's orders</summary>
    [HttpGet("my-orders")]
    public async Task<ActionResult<List<OrderDto>>> GetMyOrders()
    {
        var orders = await _orderRepo.GetUserOrdersAsync(UserId);
        return Ok(_mapper.Map<List<OrderDto>>(orders));
    }

    /// <summary>Get a single order by ID</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<OrderDto>> GetOrder(int id)
    {
        var order = await _orderRepo.GetOrderWithDetailsAsync(id);
        if (order == null) return NotFound(new { message = "Order not found" });

        // Customers can only see their own orders
        if (!User.IsInRole("Admin") && order.UserId != UserId)
            return Forbid();

        return Ok(_mapper.Map<OrderDto>(order));
    }

    // ---- Admin-only endpoints ----

    /// <summary>Get all orders with pagination (Admin only)</summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpGet]
    public async Task<ActionResult> GetAllOrders([FromQuery] PaginationParams paginationParams)
    {
        var result = await _orderRepo.GetAllOrdersAsync(paginationParams);
        return Ok(new
        {
            items = _mapper.Map<List<OrderDto>>(result.Items),
            totalCount = result.TotalCount,
            totalPages = result.TotalPages,
            currentPage = result.PageNumber
        });
    }

    /// <summary>Update order status (Admin only)</summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpPut("{id:int}/status")]
    public async Task<ActionResult<OrderDto>> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto dto)
    {
        var order = await _orderRepo.GetOrderWithDetailsAsync(id);
        if (order == null) return NotFound(new { message = "Order not found" });

        if (Enum.TryParse<OrderStatus>(dto.Status, true, out var status))
        {
            order.Status = status;
            if (status == OrderStatus.Shipped)
            {
                order.ShippedAt = DateTime.UtcNow;
                order.TrackingNumber = dto.TrackingNumber;
            }
            else if (status == OrderStatus.Delivered)
            {
                order.DeliveredAt = DateTime.UtcNow;
                order.PaymentStatus = PaymentStatus.Paid;
            }
        }
        else return BadRequest(new { message = "Invalid order status" });

        _orderRepo.Update(order);
        await _orderRepo.SaveChangesAsync();
        return Ok(_mapper.Map<OrderDto>(await _orderRepo.GetOrderWithDetailsAsync(id)));
    }

    /// <summary>Delete an order (Admin only)</summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteOrder(int id)
    {
        var order = await _orderRepo.GetByIdAsync(id);
        if (order == null) return NotFound(new { message = "Order not found" });

        _orderRepo.Delete(order);
        await _orderRepo.SaveChangesAsync();
        return NoContent();
    }

    // ---- Helper: send order emails ─────────────────────────────────────
    private async Task SendOrderEmailsAsync(
        AlManan.Core.Entities.Order order,
        AlManan.Core.DTOs.Order.ShippingAddressDto addr)
    {
        try
        {
            var emailData = new OrderEmailData
            {
                OrderNumber     = order.OrderNumber,
                CustomerName    = addr.FullName,
                CustomerEmail   = UserEmail,
                CustomerPhone   = addr.PhoneNumber,
                ShippingAddress = $"{addr.Street}, {addr.City}, {addr.Province} {addr.PostalCode}",
                PaymentMethod   = order.PaymentMethod ?? "Cash on Delivery",
                SubTotal        = order.SubTotal,
                ShippingCost    = order.ShippingCost,
                Total           = order.TotalAmount,
                OrderDate       = order.CreatedAt,
                Items = order.OrderItems.Select(i => new OrderEmailItem
                {
                    Name     = i.ProductName,
                    Size     = i.Size,
                    Color    = i.Color,
                    Quantity = i.Quantity,
                    Price    = i.UnitPrice,
                    SubTotal = i.SubTotal
                }).ToList()
            };

            if (!string.IsNullOrEmpty(UserEmail))
                await _emailService.SendOrderReceiptAsync(emailData);

            await _emailService.SendAdminOrderNotificationAsync(emailData);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Email sending failed: {ex.Message}");
        }
    }

    // ---- Helper: create or update BuyerProfile on order ----
    private async Task UpsertBuyerProfile(Order order, AlManan.Core.DTOs.Order.ShippingAddressDto addr)
    {
        try
        {
            var email = UserEmail;
            if (string.IsNullOrEmpty(email)) return;

            var profile = await _context.BuyerProfiles
                .FirstOrDefaultAsync(b => b.Email == email);

            if (profile == null)
            {
                profile = new BuyerProfile
                {
                    FullName   = addr.FullName,
                    Email      = email,
                    Phone      = addr.PhoneNumber,
                    City       = addr.City,
                    Province   = addr.Province,
                    Street     = addr.Street,
                    PostalCode = addr.PostalCode,
                    Country    = addr.Country,
                    UserId     = UserId,
                    TotalOrders = 1,
                    TotalSpent  = order.TotalAmount,
                    LastOrderAt = DateTime.UtcNow
                };
                await _context.BuyerProfiles.AddAsync(profile);
            }
            else
            {
                // Update with latest info
                profile.FullName   = addr.FullName;
                profile.Phone      = addr.PhoneNumber;
                profile.City       = addr.City;
                profile.Province   = addr.Province;
                profile.Street     = addr.Street;
                profile.PostalCode = addr.PostalCode;
                profile.TotalOrders++;
                profile.TotalSpent  += order.TotalAmount;
                profile.LastOrderAt = DateTime.UtcNow;
                profile.UpdatedAt   = DateTime.UtcNow;
                _context.BuyerProfiles.Update(profile);
            }

            await _context.SaveChangesAsync();
        }
        catch { /* Don't fail order if profile upsert fails */ }
    }
}
