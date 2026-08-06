namespace AlManan.Core.Entities;

/// <summary>
/// Auto-created/updated when a customer places an order.
/// Aggregates buyer info across all their orders.
/// </summary>
public class BuyerProfile : BaseEntity
{
    public string FullName    { get; set; } = string.Empty;
    public string Email       { get; set; } = string.Empty;
    public string Phone       { get; set; } = string.Empty;
    public string City        { get; set; } = string.Empty;
    public string Province    { get; set; } = string.Empty;
    public string Street      { get; set; } = string.Empty;
    public string PostalCode  { get; set; } = string.Empty;
    public string Country     { get; set; } = "Pakistan";

    // Stats
    public int     TotalOrders  { get; set; } = 0;
    public decimal TotalSpent   { get; set; } = 0;
    public DateTime LastOrderAt { get; set; } = DateTime.UtcNow;

    // Linked to user if they registered, null for guests
    public string? UserId { get; set; }

    // Navigation
    public AppUser? User { get; set; }
}
