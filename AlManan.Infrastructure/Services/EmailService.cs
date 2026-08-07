using AlManan.Core.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;
using MimeKit.Utils;

namespace AlManan.Infrastructure.Services;

/// <summary>
/// Gmail SMTP email service — logo embedded via CID (inline attachment)
/// </summary>
public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;
    private readonly string _logoPath;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config   = config;
        _logger   = logger;
        // Logo in wwwroot
        _logoPath = Path.Combine(AppContext.BaseDirectory, "wwwroot", "images", "logo.png");
    }

    public async Task SendOrderReceiptAsync(OrderEmailData data)
    {
        var subject = $"Order Confirmed ✦ {data.OrderNumber} — Al-Manan";
        await SendEmailAsync(data.CustomerEmail, data.CustomerName, subject, data, isAdmin: false);
    }

    public async Task SendAdminOrderNotificationAsync(OrderEmailData data)
    {
        var adminEmail = _config["Email:AdminEmail"] ?? "almananshope@gmail.com";
        var subject    = $"New Order {data.OrderNumber} — PKR {data.Total:N0}";
        await SendEmailAsync(adminEmail, "Al-Manan Admin", subject, data, isAdmin: true);
    }

    private async Task SendEmailAsync(
        string toEmail, string toName,
        string subject, OrderEmailData data, bool isAdmin)
    {
        var fromEmail = _config["Email:From"]     ?? "almananshope@gmail.com";
        var password  = _config["Email:Password"] ?? string.Empty;

        if (string.IsNullOrEmpty(password))
        {
            _logger.LogWarning("Email:Password not configured — skipping email");
            return;
        }

        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("Al-Manan", fromEmail));
            message.To.Add(new MailboxAddress(toName, toEmail));
            message.Subject = subject;

            _logger.LogInformation("Sending email to {Email} from {From}", toEmail, fromEmail);

            // Build multipart/related body with inline logo
            var builder  = new BodyBuilder();
            var logoCid  = MimeUtils.GenerateMessageId();

            // Embed logo as inline image
            if (File.Exists(_logoPath))
            {
                var logoImg = builder.LinkedResources.Add(_logoPath);
                logoImg.ContentId          = logoCid;
                logoImg.ContentDisposition = new ContentDisposition(ContentDisposition.Inline);
            }
            else
            {
                logoCid = ""; // fallback to CSS box
            }

            builder.HtmlBody = BuildReceiptHtml(data, isAdmin, logoCid);
            message.Body     = builder.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(fromEmail, password);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation("Email sent to {Email} — {Subject}", toEmail, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
        }
    }

    private static string BuildReceiptHtml(OrderEmailData data, bool isAdmin, string logoCid)
    {
        // Build items rows
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

        // Logo — CID inline or CSS fallback
        var logoHtml = !string.IsNullOrEmpty(logoCid)
            ? $@"<img src='cid:{logoCid}' alt='Al-Manan' width='80' height='80'
                      style='border-radius:16px;display:block;margin:0 auto 16px;
                             box-shadow:0 8px 24px rgba(184,149,42,0.5);' />"
            : @"<div style='display:inline-block;width:80px;height:80px;
                            background:linear-gradient(135deg,#B8952A,#7A5F12);
                            border-radius:16px;line-height:80px;font-size:38px;text-align:center;
                            margin-bottom:16px;box-shadow:0 8px 24px rgba(184,149,42,0.4);'>م</div>";

        var adminBanner = isAdmin
            ? @"<tr><td style='background:linear-gradient(135deg,#1C1A18,#2d2a26);
                               color:#fff;padding:14px 32px;text-align:center;font-size:13px;
                               letter-spacing:0.08em;'>
                  🔔 &nbsp;<strong>NEW ORDER RECEIVED</strong>&nbsp; — Admin Notification
                </td></tr>"
            : "";

        var greeting = isAdmin
            ? "A new order has been placed on Al-Manan."
            : $"Thank you, <strong>{data.CustomerName}</strong>! Your order has been confirmed.";

        return $@"<!DOCTYPE html>
<html lang='en'>
<head>
<meta charset='UTF-8'/>
<meta name='viewport' content='width=device-width,initial-scale=1'/>
<title>Al-Manan Order {data.OrderNumber}</title>
</head>
<body style='margin:0;padding:0;background:#f4f1ec;font-family:Helvetica,Arial,sans-serif;'>

<table width='100%' cellpadding='0' cellspacing='0' style='background:#f4f1ec;padding:32px 16px;'>
<tr><td align='center'>
<table width='100%' style='max-width:600px;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.12);'>

  {adminBanner}

  <!-- ===== HEADER ===== -->
  <tr><td style='background:linear-gradient(160deg,#1C1A18 0%,#2d2822 100%);
                 padding:44px 40px 36px;text-align:center;'>

    {logoHtml}

    <div style='font-family:Georgia,serif;font-size:20px;font-weight:400;
                letter-spacing:0.28em;color:#fff;margin-bottom:4px;
                text-transform:uppercase;'>AL-MANAN</div>
    <div style='font-size:10px;font-weight:700;letter-spacing:0.22em;
                text-transform:uppercase;color:#B8952A;margin-bottom:24px;'>Premium Fashion</div>

    <div style='width:48px;height:1px;background:rgba(184,149,42,0.35);
                margin:0 auto 20px;'></div>

    <div style='font-family:Georgia,serif;font-size:30px;font-weight:300;
                color:#fff;line-height:1.2;'>
      Order <em style='color:#D4A843;font-style:italic;'>Confirmed</em>
    </div>
    <div style='margin-top:8px;font-size:13px;color:rgba(255,255,255,0.45);
                letter-spacing:0.06em;'>{data.OrderDate:dddd, dd MMMM yyyy}</div>
  </td></tr>

  <!-- ===== ORDER NUMBER BAR ===== -->
  <tr><td style='background:linear-gradient(90deg,#9A7A1E,#B8952A,#9A7A1E);
                 padding:13px 40px;text-align:center;'>
    <span style='font-size:11px;font-weight:700;letter-spacing:0.2em;
                 text-transform:uppercase;color:rgba(0,0,0,0.6);'>ORDER</span>
    &nbsp;&nbsp;
    <span style='font-size:15px;font-weight:800;color:#000;
                 letter-spacing:0.1em;'>{data.OrderNumber}</span>
  </td></tr>

  <!-- ===== BODY ===== -->
  <tr><td style='background:#fff;padding:36px 40px;'>

    <p style='font-size:15px;color:#2D2A26;line-height:1.75;margin:0 0 28px;'>
      {greeting}
    </p>

    <!-- Items table -->
    <table width='100%' cellpadding='0' cellspacing='0'
           style='border:1px solid #ede8e0;border-radius:14px;overflow:hidden;margin-bottom:24px;'>
      <thead>
        <tr style='background:#faf7f2;'>
          <th style='padding:12px 16px;text-align:left;font-size:10px;font-weight:800;
                     letter-spacing:0.18em;text-transform:uppercase;color:#9e9189;
                     border-bottom:1px solid #ede8e0;'>Item</th>
          <th style='padding:12px 16px;text-align:right;font-size:10px;font-weight:800;
                     letter-spacing:0.18em;text-transform:uppercase;color:#9e9189;
                     border-bottom:1px solid #ede8e0;'>Amount</th>
        </tr>
      </thead>
      <tbody>{itemsHtml}</tbody>
    </table>

    <!-- Totals -->
    <table width='100%' cellpadding='0' cellspacing='0'
           style='background:#faf7f2;border-radius:14px;padding:20px 24px;margin-bottom:28px;'>
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

    <!-- Payment + Delivery -->
    <table width='100%' cellpadding='0' cellspacing='0' style='margin-bottom:28px;'>
      <tr>
        <td width='48%' style='vertical-align:top;'>
          <div style='background:#faf7f2;border-radius:12px;padding:18px;'>
            <div style='font-size:10px;font-weight:800;letter-spacing:0.18em;
                        text-transform:uppercase;color:#B8952A;margin-bottom:10px;'>Payment</div>
            <div style='font-size:14px;font-weight:700;color:#1C1A18;'>{data.PaymentMethod}</div>
          </div>
        </td>
        <td width='4%'></td>
        <td width='48%' style='vertical-align:top;'>
          <div style='background:#faf7f2;border-radius:12px;padding:18px;'>
            <div style='font-size:10px;font-weight:800;letter-spacing:0.18em;
                        text-transform:uppercase;color:#B8952A;margin-bottom:10px;'>Delivering To</div>
            <div style='font-size:13px;color:#2D2A26;line-height:1.65;'>
              <strong>{data.CustomerName}</strong><br/>
              {data.ShippingAddress}<br/>
              📞 {data.CustomerPhone}
            </div>
          </div>
        </td>
      </tr>
    </table>

    <!-- Thank you box -->
    <div style='background:linear-gradient(160deg,#1C1A18,#2d2822);
                border-radius:14px;padding:22px 28px;text-align:center;'>
      <div style='font-family:Georgia,serif;font-size:17px;font-weight:300;
                  color:#fff;margin-bottom:8px;'>
        Thank you for shopping with <em style='color:#D4A843;'>Al-Manan</em>
      </div>
      <div style='font-size:12px;color:rgba(255,255,255,0.4);'>
        Questions? <a href='mailto:almananshope@gmail.com'
                      style='color:#B8952A;text-decoration:none;'>almananshope@gmail.com</a>
      </div>
    </div>

  </td></tr>

  <!-- ===== FOOTER ===== -->
  <tr><td style='background:#f4f1ec;padding:20px 40px;text-align:center;'>
    <div style='font-size:10px;color:#b0a898;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:5px;'>
      Al-Manan · Premium Pakistani Fashion
    </div>
    <div style='font-size:11px;color:#c5bdb3;'>
      Free delivery above PKR 3,000 &nbsp;✦&nbsp; Easy 7-day returns &nbsp;✦&nbsp; Authentic products
    </div>
  </td></tr>

</table>
</td></tr>
</table>

</body>
</html>";
    }
}
