using AlManan.Core.DTOs.Order;
using AlManan.Core.Entities;
using AlManan.Core.Interfaces;
using AlManan.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AlManan.API.Controllers;

/// <summary>
/// Guest checkout — no authentication required
/// Creates order + buyer profile + sends emails
/// </summary>
public class GuestOrdersController : BaseApiController
{
    private readonly AppDbContext  _context;
    private readonly IOrderRepository _orderRepo;
    private readonly IEmailService _emailService;

    public GuestOrdersController(
        AppDbContext context,
        IOrderRepository orderRepo,
        IEmailService emailService)
    {
        _context      = context;
        _orderRepo    = orderRepo;
        _emailService = emailService;
    }

    /// <summary>Place a guest order (no login needed)</summary>
    [HttpPost]
    [AllowAnonymous]
    public async Task<ActionResult> PlaceGuestOrder([FromBody] GuestOrderRequest req)
    {
        if (req.Items == null || !req.Items.Any())
            return BadRequest(new { message = "No items in order" });

        // Build order
        var order = new Order
        {
            UserId        = null,  // Guest order — no user account
            OrderNumber   = $"AM-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}",
            PaymentMethod = req.PaymentMethod,
            Notes         = req.Notes,
            ShippingCost  = req.ShippingCost,
            SubTotal      = req.SubTotal,
            Discount      = 0,
            TotalAmount   = req.TotalAmount,
            Status        = OrderStatus.Pending,
            PaymentStatus = PaymentStatus.Pending
        };

        foreach (var item in req.Items)
        {
            order.OrderItems.Add(new OrderItem
            {
                ProductId    = item.ProductId,
                ProductName  = item.ProductName,
                Quantity     = item.Quantity,
                Size         = item.Size,
                Color        = item.Color,
                UnitPrice    = item.UnitPrice,
                SubTotal     = item.SubTotal
            });
        }

        // Shipping address
        order.ShippingAddress = new ShippingAddress
        {
            FullName    = req.ShippingAddress.FullName,
            PhoneNumber = req.ShippingAddress.PhoneNumber,
            Street      = req.ShippingAddress.Street,
            City        = req.ShippingAddress.City,
            Province    = req.ShippingAddress.Province,
            PostalCode  = req.ShippingAddress.PostalCode,
            Country     = req.ShippingAddress.Country
        };

        await _orderRepo.AddAsync(order);
        await _orderRepo.SaveChangesAsync();

        // Upsert buyer profile
        await UpsertBuyerProfile(req, order.TotalAmount);

        // Send emails (fire & forget)
        _ = SendEmailsAsync(order, req);

        return Ok(new
        {
            orderNumber = order.OrderNumber,
            orderId     = order.Id,
            message     = "Order placed successfully"
        });
    }

    private async Task UpsertBuyerProfile(GuestOrderRequest req, decimal total)
    {
        try
        {
            var existing = await _context.BuyerProfiles
                .FirstOrDefaultAsync(b => b.Email == req.CustomerEmail);

            if (existing == null)
            {
                await _context.BuyerProfiles.AddAsync(new BuyerProfile
                {
                    FullName    = req.CustomerName,
                    Email       = req.CustomerEmail,
                    Phone       = req.CustomerPhone,
                    City        = req.ShippingAddress.City,
                    Province    = req.ShippingAddress.Province,
                    Street      = req.ShippingAddress.Street,
                    PostalCode  = req.ShippingAddress.PostalCode,
                    Country     = req.ShippingAddress.Country,
                    TotalOrders = 1,
                    TotalSpent  = total,
                    LastOrderAt = DateTime.UtcNow
                });
            }
            else
            {
                existing.FullName    = req.CustomerName;
                existing.Phone       = req.CustomerPhone;
                existing.City        = req.ShippingAddress.City;
                existing.Province    = req.ShippingAddress.Province;
                existing.Street      = req.ShippingAddress.Street;
                existing.TotalOrders++;
                existing.TotalSpent  += total;
                existing.LastOrderAt = DateTime.UtcNow;
                existing.UpdatedAt   = DateTime.UtcNow;
            }
            await _context.SaveChangesAsync();
        }
        catch { /* silent */ }
    }

    private async Task SendEmailsAsync(Order order, GuestOrderRequest req)
    {
        try
        {
            var emailData = new OrderEmailData
            {
                OrderNumber     = order.OrderNumber,
                CustomerName    = req.CustomerName,
                CustomerEmail   = req.CustomerEmail,
                CustomerPhone   = req.CustomerPhone,
                ShippingAddress = $"{req.ShippingAddress.Street}, {req.ShippingAddress.City}, {req.ShippingAddress.Province}",
                PaymentMethod   = req.PaymentMethod,
                SubTotal        = order.SubTotal,
                ShippingCost    = order.ShippingCost,
                Total           = order.TotalAmount,
                OrderDate       = order.CreatedAt,
                Items           = req.Items.Select(i => new OrderEmailItem
                {
                    Name     = i.ProductName,
                    Size     = i.Size,
                    Color    = i.Color,
                    Quantity = i.Quantity,
                    Price    = i.UnitPrice,
                    SubTotal = i.SubTotal
                }).ToList()
            };

            if (!string.IsNullOrEmpty(req.CustomerEmail))
                await _emailService.SendOrderReceiptAsync(emailData);

            await _emailService.SendAdminOrderNotificationAsync(emailData);
        }
        catch { /* silent */ }
    }
}

// ── Request models ──────────────────────────────────────────────────────────
public class GuestOrderRequest
{
    public string CustomerEmail  { get; set; } = string.Empty;
    public string CustomerName   { get; set; } = string.Empty;
    public string CustomerPhone  { get; set; } = string.Empty;
    public string PaymentMethod  { get; set; } = "cod";
    public string? Notes         { get; set; }
    public decimal SubTotal      { get; set; }
    public decimal ShippingCost  { get; set; }
    public decimal TotalAmount   { get; set; }
    public GuestShippingAddress ShippingAddress { get; set; } = new();
    public List<GuestOrderItem>  Items          { get; set; } = new();
}

public class GuestShippingAddress
{
    public string FullName    { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Street      { get; set; } = string.Empty;
    public string City        { get; set; } = string.Empty;
    public string Province    { get; set; } = string.Empty;
    public string PostalCode  { get; set; } = string.Empty;
    public string Country     { get; set; } = "Pakistan";
}

public class GuestOrderItem
{
    public int     ProductId   { get; set; }
    public string  ProductName { get; set; } = string.Empty;
    public int     Quantity    { get; set; }
    public string  Size        { get; set; } = string.Empty;
    public string? Color       { get; set; }
    public decimal UnitPrice   { get; set; }
    public decimal SubTotal    { get; set; }
}
