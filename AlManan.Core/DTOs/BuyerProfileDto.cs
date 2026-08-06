namespace AlManan.Core.DTOs;

public class BuyerProfileDto
{
    public int      Id          { get; set; }
    public string   FullName    { get; set; } = string.Empty;
    public string   Email       { get; set; } = string.Empty;
    public string   Phone       { get; set; } = string.Empty;
    public string   City        { get; set; } = string.Empty;
    public string   Province    { get; set; } = string.Empty;
    public string   Street      { get; set; } = string.Empty;
    public string   PostalCode  { get; set; } = string.Empty;
    public string   Country     { get; set; } = string.Empty;
    public int      TotalOrders { get; set; }
    public decimal  TotalSpent  { get; set; }
    public DateTime LastOrderAt { get; set; }
    public string?  UserId      { get; set; }
    public DateTime CreatedAt   { get; set; }
}
