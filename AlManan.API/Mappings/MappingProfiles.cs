using AlManan.Core.DTOs.Cart;
using AlManan.Core.DTOs.Order;
using AlManan.Core.DTOs.Product;
using AlManan.Core.Entities;
using AutoMapper;

namespace AlManan.API.Mappings;

/// <summary>
/// AutoMapper profiles for entity to DTO mappings
/// </summary>
public class MappingProfiles : Profile
{
    public MappingProfiles()
    {
        // Product
        CreateMap<Product, ProductDto>()
            .ForMember(d => d.CategoryName, o => o.MapFrom(s => s.Category != null ? s.Category.Name : string.Empty))
            .ForMember(d => d.GenderType, o => o.MapFrom(s => s.Category != null ? s.Category.Gender.ToString() : null))
            .ForMember(d => d.MainImageUrl, o => o.MapFrom(s =>
                s.Images.FirstOrDefault(i => i.IsMain)!.ImageUrl ?? s.Images.FirstOrDefault()!.ImageUrl));

        CreateMap<ProductImage, ProductImageDto>();
        CreateMap<ProductVariant, ProductVariantDto>();
        CreateMap<ProductCreateDto, Product>()
            .ForMember(d => d.Slug, o => o.MapFrom(s => GenerateSlug(s.Name)));
        CreateMap<ProductUpdateDto, Product>()
            .ForMember(d => d.Slug, o => o.MapFrom(s => GenerateSlug(s.Name)));
        CreateMap<ProductVariantCreateDto, ProductVariant>();

        // Order
        CreateMap<Order, OrderDto>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.PaymentStatus, o => o.MapFrom(s => s.PaymentStatus.ToString()));

        CreateMap<OrderItem, OrderItemDto>();
        CreateMap<ShippingAddress, ShippingAddressDto>();
        CreateMap<ShippingAddressDto, ShippingAddress>();

        // Cart
        CreateMap<CartBasket, CartDto>()
            .ForMember(d => d.TotalItems, o => o.MapFrom(s => s.Items.Sum(i => i.Quantity)))
            .ForMember(d => d.SubTotal, o => o.MapFrom(s =>
                s.Items.Sum(i => (i.Product!.SalePrice ?? i.Product.Price) * i.Quantity)));

        CreateMap<CartItem, CartItemDto>()
            .ForMember(d => d.ProductName, o => o.MapFrom(s => s.Product != null ? s.Product.Name : string.Empty))
            .ForMember(d => d.UnitPrice, o => o.MapFrom(s => s.Product != null ? s.Product.Price : 0))
            .ForMember(d => d.SalePrice, o => o.MapFrom(s => s.Product != null ? s.Product.SalePrice : null))
            .ForMember(d => d.ProductImageUrl, o => o.MapFrom(s =>
                s.Product != null ? s.Product.Images.FirstOrDefault(i => i.IsMain)!.ImageUrl : null))
            .ForMember(d => d.SubTotal, o => o.MapFrom(s =>
                s.Product != null ? (s.Product.SalePrice ?? s.Product.Price) * s.Quantity : 0))
            .ForMember(d => d.AvailableStock, o => o.MapFrom(s =>
                s.Product != null ? s.Product.StockQuantity : 0));
    }

    private static string GenerateSlug(string name)
    {
        var slug = name.ToLower()
            .Replace(" ", "-")
            .Replace("'", "")
            .Replace("\"", "")
            .Replace("&", "and")
            .Replace(".", "")
            .Replace(",", "");
        // Add timestamp suffix to ensure uniqueness
        return $"{slug}-{DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString().Substring(5)}";
    }
}
