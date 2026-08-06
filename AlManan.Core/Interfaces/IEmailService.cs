namespace AlManan.Core.Interfaces;

public interface IEmailService
{
    Task SendOrderReceiptAsync(OrderEmailData data);
    Task SendAdminOrderNotificationAsync(OrderEmailData data);
}

public class OrderEmailData
{
    public string  OrderNumber    { get; set; } = string.Empty;
    public string  CustomerName   { get; set; } = string.Empty;
    public string  CustomerEmail  { get; set; } = string.Empty;
    public string  CustomerPhone  { get; set; } = string.Empty;
    public string  ShippingAddress{ get; set; } = string.Empty;
    public string  PaymentMethod  { get; set; } = string.Empty;
    public decimal SubTotal       { get; set; }
    public decimal ShippingCost   { get; set; }
    public decimal Total          { get; set; }
    public DateTime OrderDate     { get; set; }
    public List<OrderEmailItem> Items { get; set; } = new();
}

public class OrderEmailItem
{
    public string  Name     { get; set; } = string.Empty;
    public string  Size     { get; set; } = string.Empty;
    public string? Color    { get; set; }
    public int     Quantity { get; set; }
    public decimal Price    { get; set; }
    public decimal SubTotal { get; set; }
}
