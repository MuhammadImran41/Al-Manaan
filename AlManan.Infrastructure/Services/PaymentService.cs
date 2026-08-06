using AlManan.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AlManan.Infrastructure.Services;

/// <summary>
/// Payment service — JazzCash, EasyPaisa, and Stripe integration stubs.
///
/// TO ACTIVATE:
///   JazzCash  — set JazzCash:MerchantId, JazzCash:Password, JazzCash:IntegritySalt in appsettings
///   EasyPaisa — set EasyPaisa:StoreId, EasyPaisa:HashKey in appsettings
///   Stripe    — set Stripe:SecretKey in appsettings, install Stripe.net NuGet package
/// </summary>
public class PaymentService : IPaymentService
{
    private readonly IConfiguration _config;
    private readonly ILogger<PaymentService> _logger;

    public PaymentService(IConfiguration config, ILogger<PaymentService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task<PaymentInitResult> InitiatePaymentAsync(PaymentRequest request)
    {
        return request.Gateway.ToLower() switch
        {
            "jazzcash"  => await InitiateJazzCashAsync(request),
            "easypaisa" => await InitiateEasyPaisaAsync(request),
            "stripe"    => await InitiateStripeAsync(request),
            "cod"       => new PaymentInitResult { Success = true, TransactionId = $"COD-{request.OrderNumber}" },
            _           => new PaymentInitResult { Success = false, Error = "Unsupported payment gateway" }
        };
    }

    public async Task<PaymentVerifyResult> VerifyPaymentAsync(string transactionId, string gateway)
    {
        // In production: call gateway API to verify transaction status
        _logger.LogInformation("Verifying {Gateway} payment {TxId}", gateway, transactionId);
        await Task.CompletedTask;

        return new PaymentVerifyResult
        {
            Success = true,
            IsPaid = true,
            TransactionId = transactionId
        };
    }

    // ---------------------------------------------------------------
    // JazzCash — Pakistan mobile payment (MWALLET API)
    // Docs: https://sandbox.jazzcash.com.pk/
    // ---------------------------------------------------------------
    private async Task<PaymentInitResult> InitiateJazzCashAsync(PaymentRequest request)
    {
        var merchantId = _config["JazzCash:MerchantId"];
        var password   = _config["JazzCash:Password"];
        var salt       = _config["JazzCash:IntegritySalt"];

        if (string.IsNullOrEmpty(merchantId) || string.IsNullOrEmpty(password))
        {
            _logger.LogWarning("JazzCash credentials not configured. Set JazzCash:MerchantId and JazzCash:Password in appsettings.");
            return new PaymentInitResult { Success = false, Error = "JazzCash not configured" };
        }

        // Build form-post parameters for JazzCash Hosted Checkout
        var txnDateTime = DateTime.Now.ToString("yyyyMMddHHmmss");
        var txnRefNo    = $"T{txnDateTime}";
        var amountPaisa = ((int)(request.Amount * 100)).ToString();  // JazzCash uses paisas

        // HMAC-SHA256 hash — pp_TxnRefNo&pp_Amount&pp_TxnDateTime (simplified)
        var hashStr = $"{salt}&{amountPaisa}&{merchantId}&{request.CustomerPhone}&{txnRefNo}&{txnDateTime}&PKR&S";
        var hash    = ComputeHmacSha256(hashStr, salt ?? "");

        var jazzCashUrl = _config["JazzCash:BaseUrl"] ?? "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/";

        var formParams = new Dictionary<string, string>
        {
            ["pp_Version"]        = "1.1",
            ["pp_TxnType"]        = "MWALLET",
            ["pp_Language"]       = "EN",
            ["pp_MerchantID"]     = merchantId,
            ["pp_Password"]       = password,
            ["pp_TxnRefNo"]       = txnRefNo,
            ["pp_Amount"]         = amountPaisa,
            ["pp_TxnCurrency"]    = "PKR",
            ["pp_TxnDateTime"]    = txnDateTime,
            ["pp_BillReference"]  = request.OrderNumber,
            ["pp_Description"]    = $"Al-Manan Order {request.OrderNumber}",
            ["pp_TxnExpiryDateTime"] = DateTime.Now.AddHours(1).ToString("yyyyMMddHHmmss"),
            ["pp_ReturnURL"]      = request.ReturnUrl,
            ["pp_SecureHash"]     = hash,
            ["ppmpf_1"]           = request.CustomerPhone
        };

        // Return the gateway URL + params (frontend will POST to this)
        var queryString = string.Join("&", formParams.Select(kv => $"{kv.Key}={Uri.EscapeDataString(kv.Value)}"));
        await Task.CompletedTask;

        return new PaymentInitResult
        {
            Success = true,
            RedirectUrl = $"{jazzCashUrl}?{queryString}",
            TransactionId = txnRefNo
        };
    }

    // ---------------------------------------------------------------
    // EasyPaisa — Pakistan mobile payment
    // Docs: https://ea.easypaisa.com.pk/
    // ---------------------------------------------------------------
    private async Task<PaymentInitResult> InitiateEasyPaisaAsync(PaymentRequest request)
    {
        var storeId = _config["EasyPaisa:StoreId"];
        var hashKey = _config["EasyPaisa:HashKey"];

        if (string.IsNullOrEmpty(storeId))
        {
            _logger.LogWarning("EasyPaisa credentials not configured.");
            return new PaymentInitResult { Success = false, Error = "EasyPaisa not configured" };
        }

        var orderId      = request.OrderNumber;
        var amountStr    = request.Amount.ToString("F2");
        var transactionId = $"EP-{orderId}-{DateTime.Now:yyyyMMddHHmmss}";

        // EasyPaisa uses a hash of: storeId + orderId + transactionAmount + mobileAccountNo + emailAddress + orderDate + postBackURL + autoRedirect + hashKey
        var hashStr = $"{storeId}{orderId}{amountStr}{request.CustomerPhone}{request.CustomerEmail}{DateTime.Now:yyyyMMdd}{request.ReturnUrl}0{hashKey}";
        var hash    = ComputeSha256Hex(hashStr);

        var baseUrl = _config["EasyPaisa:BaseUrl"] ?? "https://easypaystg.easypaisa.com.pk/tpg/";
        var redirectUrl = $"{baseUrl}?storeId={storeId}&orderId={orderId}&transactionAmount={amountStr}&mobileAccountNo={request.CustomerPhone}&emailAddress={Uri.EscapeDataString(request.CustomerEmail)}&orderDate={DateTime.Now:yyyyMMdd}&postBackURL={Uri.EscapeDataString(request.ReturnUrl)}&autoRedirect=0&signature={hash}";

        await Task.CompletedTask;

        return new PaymentInitResult
        {
            Success = true,
            RedirectUrl = redirectUrl,
            TransactionId = transactionId
        };
    }

    // ---------------------------------------------------------------
    // Stripe — International card payments
    // Install: dotnet add package Stripe.net --version 46.0.0
    // Docs: https://stripe.com/docs
    // ---------------------------------------------------------------
    private async Task<PaymentInitResult> InitiateStripeAsync(PaymentRequest request)
    {
        var secretKey = _config["Stripe:SecretKey"];
        if (string.IsNullOrEmpty(secretKey))
        {
            _logger.LogWarning("Stripe secret key not configured. Set Stripe:SecretKey in appsettings.");
            return new PaymentInitResult { Success = false, Error = "Stripe not configured" };
        }

        // TODO: Uncomment when Stripe.net NuGet is added:
        // Stripe.StripeClient.ApiKey = secretKey;
        // var service = new Stripe.PaymentIntentService();
        // var intent = await service.CreateAsync(new Stripe.PaymentIntentCreateOptions
        // {
        //     Amount = (long)(request.Amount * 100),   // Stripe uses smallest currency unit
        //     Currency = "pkr",
        //     Metadata = new Dictionary<string, string> { ["order_id"] = request.OrderId.ToString() }
        // });
        // return new PaymentInitResult { Success = true, ClientSecret = intent.ClientSecret, TransactionId = intent.Id };

        _logger.LogWarning("Stripe.net package not installed. Add it with: dotnet add package Stripe.net --version 46.0.0");
        await Task.CompletedTask;

        return new PaymentInitResult
        {
            Success = false,
            Error = "Stripe.net package not installed. See PaymentService.cs for instructions."
        };
    }

    // ---------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------
    private static string ComputeHmacSha256(string data, string key)
    {
        using var hmac = new System.Security.Cryptography.HMACSHA256(System.Text.Encoding.UTF8.GetBytes(key));
        var hash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(data));
        return BitConverter.ToString(hash).Replace("-", "").ToLower();
    }

    private static string ComputeSha256Hex(string data)
    {
        using var sha = System.Security.Cryptography.SHA256.Create();
        var hash = sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(data));
        return BitConverter.ToString(hash).Replace("-", "").ToLower();
    }
}
