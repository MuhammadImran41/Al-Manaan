using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using AlManan.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AlManan.Infrastructure.Services;

/// <summary>
/// Resend API email service — works on Railway, no SMTP ports needed
/// https://resend.com — free 3,000 emails/month
/// </summary>
public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;
    private readonly HttpClient _http;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
        _http   = new HttpClient();
        _http.BaseAddress = new Uri("https://api.resend.com/");
    }

    public async Task SendOrderReceiptAsync(OrderEmailData data)
    {
        var subject = $"Order Confirmed — {data.OrderNumber} | Al-Manan";
        await SendAsync(data.CustomerEmail, data.CustomerName, subject, data, isAdmin: false);
    }

    public async Task SendAdminOrderNotificationAsync(OrderEmailData data)
    {
        var adminEmail = _config["Email:AdminEmail"] ?? "almananshop@gmail.com";
        var subject    = $"New Order {data.OrderNumber} — PKR {data.Total:N0}";
        await SendAsync(adminEmail, "Al-Manan Admin", subject, data, isAdmin: true);
    }

    private async Task SendAsync(string toEmail, string toName, string subject, OrderEmailData data, bool isAdmin)
    {
        var apiKey = _config["Resend:ApiKey"] ?? _config["Resend__ApiKey"] ?? string.Empty;

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            _logger.LogWarning("Resend:ApiKey not configured — skipping email to {Email}", toEmail);
            return;
        }

        var fromEmail = _config["Email:From"] ?? "onboarding@resend.dev";
        var fromName  = "Al-Manan";

        // Resend requires verified domain — use resend.dev for testing
        // Once almanan.shop domain verified in Resend dashboard, change to orders@almanan.shop
        var from = fromEmail.Contains("resend.dev")
            ? fromEmail
            : $"{fromName} <{fromEmail}>";

        var payload = new
        {
            from    = from,
            to      = new[] { toEmail },
            subject = subject,
            html    = BuildReceiptHtml(data, isAdmin)
        };

        var json    = JsonSerializer.Serialize(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        _http.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", apiKey);

        try
        {
            var response = await _http.PostAsync("emails", content);
            var body     = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
                _logger.LogInformation("Resend: email sent to {Email} — {Subject}", toEmail, subject);
            else
                _logger.LogError("Resend error {Status}: {Body}", response.StatusCode, body);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Resend: failed to send email to {Email}", toEmail);
        }
    }

    private static string BuildReceiptHtml(OrderEmailData data, bool isAdmin)
    {
        var itemsHtml = string.Empty;
        foreach (var item in data.Items)
        {
            var meta = item.Size;
            if (!string.IsNullOrEmpty(item.Color)) meta += $" · {item.Color}";
            itemsHtml += $@"
            <tr>
              <td style='padding:14px 16px;border-bottom:1px solid #f0ebe3;'>
                <div style='font-family:Georgia,serif;font-size:14px;font-weight:600;color:#1C1A18;margin-bottom:3px;'>{item.Name}</div>
                <div style='font-size:12px;color:#9e9189;'>{meta} &nbsp;×&nbsp; {item.Quantity}</div>
              </td>
              <td style='padding:14px 16px;border-bottom:1px solid #f0ebe3;text-align:right;font-size:14px;font-weight:600;color:#1C1A18;white-space:nowrap;'>
                PKR {item.SubTotal:N0}
              </td>
            </tr>";
        }

        var adminBanner = isAdmin ? @"
            <tr><td colspan='2' style='background:linear-gradient(135deg,#1C1A18,#2d2a26);
                color:#fff;padding:14px 32px;text-align:center;font-size:13px;letter-spacing:0.08em;'>
                <strong>NEW ORDER RECEIVED</strong> — Admin Notification
            </td></tr>" : "";

        var greeting = isAdmin
            ? "A new order has been placed on Al-Manan."
            : $"Thank you, <strong>{data.CustomerName}</strong>! Your order has been confirmed.";

        return $@"<!DOCTYPE html>
<html lang='en'>
<head><meta charset='UTF-8'/><meta name='viewport' content='width=device-width,initial-scale=1'/></head>
<body style='margin:0;padding:0;background:#f4f1ec;font-family:Helvetica,Arial,sans-serif;'>
<table width='100%' cellpadding='0' cellspacing='0' style='background:#f4f1ec;padding:32px 16px;'>
<tr><td align='center'>
<table width='100%' style='max-width:600px;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.12);'>

  {adminBanner}

  <tr><td style='background:linear-gradient(160deg,#1C1A18 0%,#2d2822 100%);padding:44px 40px 36px;text-align:center;'>
    <div style='width:70px;height:70px;background:linear-gradient(135deg,#B8952A,#7A5F12);border-radius:16px;
                display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;
                box-shadow:0 8px 24px rgba(184,149,42,0.5);'>
      <span style='font-size:32px;color:#fff;font-family:Georgia,serif;'>م</span>
    </div>
    <div style='font-family:Georgia,serif;font-size:20px;letter-spacing:0.28em;color:#fff;text-transform:uppercase;margin-bottom:4px;'>AL-MANAN</div>
    <div style='font-size:10px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:#B8952A;margin-bottom:24px;'>Premium Fashion</div>
    <div style='font-family:Georgia,serif;font-size:30px;font-weight:300;color:#fff;line-height:1.2;'>
      Order <em style='color:#D4A843;font-style:italic;'>Confirmed</em>
    </div>
    <div style='margin-top:8px;font-size:13px;color:rgba(255,255,255,0.45);letter-spacing:0.06em;'>{data.OrderDate:dddd, dd MMMM yyyy}</div>
  </td></tr>

  <tr><td style='background:linear-gradient(90deg,#9A7A1E,#B8952A,#9A7A1E);padding:13px 40px;text-align:center;'>
    <span style='font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:rgba(0,0,0,0.6);'>ORDER</span>
    &nbsp;&nbsp;
    <span style='font-size:15px;font-weight:800;color:#000;letter-spacing:0.1em;'>{data.OrderNumber}</span>
  </td></tr>

  <tr><td style='background:#fff;padding:36px 40px;'>
    <p style='font-size:15px;color:#2D2A26;line-height:1.75;margin:0 0 28px;'>{greeting}</p>

    <table width='100%' cellpadding='0' cellspacing='0' style='border:1px solid #ede8e0;border-radius:14px;overflow:hidden;margin-bottom:24px;'>
      <thead>
        <tr style='background:#faf7f2;'>
          <th style='padding:12px 16px;text-align:left;font-size:10px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:#9e9189;border-bottom:1px solid #ede8e0;'>Item</th>
          <th style='padding:12px 16px;text-align:right;font-size:10px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:#9e9189;border-bottom:1px solid #ede8e0;'>Amount</th>
        </tr>
      </thead>
      <tbody>{itemsHtml}</tbody>
    </table>

    <table width='100%' cellpadding='0' cellspacing='0' style='background:#faf7f2;border-radius:14px;padding:20px 24px;margin-bottom:28px;'>
      <tr>
        <td style='padding:5px 0;font-size:13px;color:#7A6F62;'>Subtotal</td>
        <td style='padding:5px 0;font-size:13px;color:#1C1A18;font-weight:600;text-align:right;'>PKR {data.SubTotal:N0}</td>
      </tr>
      <tr>
        <td style='padding:5px 0;font-size:13px;color:#7A6F62;'>Shipping</td>
        <td style='padding:5px 0;font-size:13px;color:#1C1A18;font-weight:600;text-align:right;'>{(data.ShippingCost == 0 ? "Free" : $"PKR {data.ShippingCost:N0}")}</td>
      </tr>
      <tr><td colspan='2'><div style='height:1px;background:#e8e0d5;margin:10px 0;'></div></td></tr>
      <tr>
        <td style='font-family:Georgia,serif;font-size:17px;font-weight:600;color:#1C1A18;'>Total</td>
        <td style='font-family:Georgia,serif;font-size:22px;font-weight:700;color:#B8952A;text-align:right;'>PKR {data.Total:N0}</td>
      </tr>
    </table>

    <table width='100%' cellpadding='0' cellspacing='0' style='margin-bottom:28px;'>
      <tr>
        <td width='48%' style='vertical-align:top;'>
          <div style='background:#faf7f2;border-radius:12px;padding:18px;'>
            <div style='font-size:10px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:#B8952A;margin-bottom:10px;'>Payment</div>
            <div style='font-size:14px;font-weight:700;color:#1C1A18;'>{data.PaymentMethod}</div>
          </div>
        </td>
        <td width='4%'></td>
        <td width='48%' style='vertical-align:top;'>
          <div style='background:#faf7f2;border-radius:12px;padding:18px;'>
            <div style='font-size:10px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:#B8952A;margin-bottom:10px;'>Delivering To</div>
            <div style='font-size:13px;color:#2D2A26;line-height:1.65;'>
              <strong>{data.CustomerName}</strong><br/>
              {data.ShippingAddress}<br/>
              {data.CustomerPhone}
            </div>
          </div>
        </td>
      </tr>
    </table>

    <div style='background:linear-gradient(160deg,#1C1A18,#2d2822);border-radius:14px;padding:22px 28px;text-align:center;'>
      <div style='font-family:Georgia,serif;font-size:17px;font-weight:300;color:#fff;margin-bottom:8px;'>
        Thank you for shopping with <em style='color:#D4A843;'>Al-Manan</em>
      </div>
      <div style='font-size:12px;color:rgba(255,255,255,0.4);'>
        Questions? <a href='mailto:almananshop@gmail.com' style='color:#B8952A;text-decoration:none;'>almananshop@gmail.com</a>
      </div>
    </div>
  </td></tr>

  <tr><td style='background:#f4f1ec;padding:20px 40px;text-align:center;'>
    <div style='font-size:10px;color:#b0a898;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:5px;'>Al-Manan · Premium Pakistani Fashion</div>
    <div style='font-size:11px;color:#c5bdb3;'>Free delivery above PKR 3,000 &nbsp;✦&nbsp; Easy 7-day returns</div>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>";
    }
}
