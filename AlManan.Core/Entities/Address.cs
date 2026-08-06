namespace AlManan.Core.Entities;

/// <summary>
/// Saved delivery address for a user
/// </summary>
public class Address : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Province { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string Country { get; set; } = "Pakistan";
    public bool IsDefault { get; set; } = false;

    public AppUser? User { get; set; }
}

/// <summary>
/// Shipping address snapshot stored on an order
/// </summary>
public class ShippingAddress : BaseEntity
{
    public int OrderId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Province { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string Country { get; set; } = "Pakistan";

    public Order? Order { get; set; }
}
