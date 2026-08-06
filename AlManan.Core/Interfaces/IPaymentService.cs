namespace AlManan.Core.Interfaces;

/// <summary>
/// Payment service interface — supports JazzCash, EasyPaisa, and Stripe
/// </summary>
public interface IPaymentService
{
    /// <summary>Initiate a payment intent / session for an order</summary>
    Task<PaymentInitResult> InitiatePaymentAsync(PaymentRequest request);

    /// <summary>Verify a payment callback from the gateway</summary>
    Task<PaymentVerifyResult> VerifyPaymentAsync(string transactionId, string gateway);
}

public class PaymentRequest
{
    public int OrderId { get; set; }
    public decimal Amount { get; set; }              // PKR
    public string OrderNumber { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string Gateway { get; set; } = "cod";     // jazzcash | easypaisa | stripe | cod
    public string ReturnUrl { get; set; } = string.Empty;
}

public class PaymentInitResult
{
    public bool Success { get; set; }
    public string? RedirectUrl { get; set; }          // For hosted payment pages
    public string? ClientSecret { get; set; }         // For Stripe Elements
    public string? TransactionId { get; set; }
    public string? Error { get; set; }
}

public class PaymentVerifyResult
{
    public bool Success { get; set; }
    public bool IsPaid { get; set; }
    public string? TransactionId { get; set; }
    public string? Error { get; set; }
}
