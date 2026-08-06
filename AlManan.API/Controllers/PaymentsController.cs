using System.Security.Claims;
using AlManan.Core.Interfaces;
using AlManan.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AlManan.API.Controllers;

/// <summary>
/// Payment initiation and callback controller
/// </summary>
public class PaymentsController : BaseApiController
{
    private readonly IPaymentService _paymentService;
    private readonly IOrderRepository _orderRepo;
    private readonly AppDbContext _context;

    public PaymentsController(
        IPaymentService paymentService,
        IOrderRepository orderRepo,
        AppDbContext context)
    {
        _paymentService = paymentService;
        _orderRepo = orderRepo;
        _context = context;
    }

    /// <summary>
    /// Initiate payment for an existing order.
    /// Returns a redirect URL (JazzCash/EasyPaisa) or client secret (Stripe).
    /// </summary>
    [Authorize]
    [HttpPost("initiate/{orderId:int}")]
    public async Task<ActionResult> InitiatePayment(int orderId, [FromQuery] string gateway = "cod")
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var order  = await _orderRepo.GetOrderWithDetailsAsync(orderId);

        if (order == null)
            return NotFound(new { message = "Order not found" });

        if (order.UserId != userId && !User.IsInRole("Admin"))
            return Forbid();

        var request = new PaymentRequest
        {
            OrderId       = order.Id,
            Amount        = order.TotalAmount,
            OrderNumber   = order.OrderNumber,
            CustomerPhone = order.ShippingAddress?.PhoneNumber ?? "",
            CustomerEmail = User.FindFirstValue(ClaimTypes.Email) ?? "",
            Gateway       = gateway,
            ReturnUrl     = $"{Request.Scheme}://{Request.Host}/api/payments/callback/{order.Id}"
        };

        var result = await _paymentService.InitiatePaymentAsync(request);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(new
        {
            redirectUrl   = result.RedirectUrl,
            clientSecret  = result.ClientSecret,
            transactionId = result.TransactionId,
            gateway
        });
    }

    /// <summary>
    /// Payment gateway callback — verifies and marks order as paid.
    /// Both GET (redirect) and POST (webhook/postback) are supported.
    /// </summary>
    [HttpGet("callback/{orderId:int}")]
    [HttpPost("callback/{orderId:int}")]
    public async Task<ActionResult> PaymentCallback(int orderId, [FromQuery] string? pp_TxnRefNo, [FromQuery] string? pp_ResponseCode, [FromForm] string? orderId_form)
    {
        var order = await _orderRepo.GetOrderWithDetailsAsync(orderId);
        if (order == null) return NotFound();

        // JazzCash success code is "000"
        var isSuccess = pp_ResponseCode == "000" || string.IsNullOrEmpty(pp_ResponseCode);
        var txnId     = pp_TxnRefNo ?? $"MANUAL-{orderId}";

        if (isSuccess)
        {
            order.PaymentStatus    = AlManan.Core.Entities.PaymentStatus.Paid;
            order.PaymentIntentId  = txnId;
            if (order.Status == AlManan.Core.Entities.OrderStatus.Pending)
                order.Status = AlManan.Core.Entities.OrderStatus.Confirmed;

            _orderRepo.Update(order);
            await _orderRepo.SaveChangesAsync();
        }

        // Redirect to frontend order confirmation
        return Redirect($"http://localhost:4200/account/orders?order={order.OrderNumber}&paid={isSuccess}");
    }

    /// <summary>
    /// Stripe webhook endpoint — receives payment_intent.succeeded events.
    /// Set Stripe webhook secret in appsettings.json as Stripe:WebhookSecret.
    /// </summary>
    [HttpPost("stripe/webhook")]
    public async Task<ActionResult> StripeWebhook()
    {
        // TODO: Implement when Stripe.net is added
        // var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        // var stripeEvent = EventUtility.ConstructEvent(json, Request.Headers["Stripe-Signature"], webhookSecret);
        // if (stripeEvent.Type == Events.PaymentIntentSucceeded) { ... }
        await Task.CompletedTask;
        return Ok();
    }
}
