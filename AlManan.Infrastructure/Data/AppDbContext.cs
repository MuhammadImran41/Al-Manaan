using AlManan.Core.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace AlManan.Infrastructure.Data;

/// <summary>
/// Main application database context
/// </summary>
public class AppDbContext : IdentityDbContext<AppUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<ProductVariant> ProductVariants => Set<ProductVariant>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<ShippingAddress> ShippingAddresses => Set<ShippingAddress>();
    public DbSet<CartBasket> CartBaskets => Set<CartBasket>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<WishlistItem> WishlistItems => Set<WishlistItem>();
    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<BuyerProfile> BuyerProfiles => Set<BuyerProfile>();
    public DbSet<Review> Reviews => Set<Review>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Product
        builder.Entity<Product>()
            .Property(p => p.Price)
            .HasColumnType("decimal(18,2)");

        builder.Entity<Product>()
            .Property(p => p.SalePrice)
            .HasColumnType("decimal(18,2)");

        builder.Entity<Product>()
            .HasIndex(p => p.Slug)
            .IsUnique();

        // Category
        builder.Entity<Category>()
            .HasIndex(c => c.Slug)
            .IsUnique();

        builder.Entity<Category>()
            .HasOne(c => c.ParentCategory)
            .WithMany(c => c.SubCategories)
            .HasForeignKey(c => c.ParentCategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // Order
        builder.Entity<Order>()
            .Property(o => o.SubTotal)
            .HasColumnType("decimal(18,2)");

        builder.Entity<Order>()
            .Property(o => o.TotalAmount)
            .HasColumnType("decimal(18,2)");

        builder.Entity<Order>()
            .Property(o => o.ShippingCost)
            .HasColumnType("decimal(18,2)");

        builder.Entity<Order>()
            .Property(o => o.Discount)
            .HasColumnType("decimal(18,2)");

        builder.Entity<Order>()
            .HasIndex(o => o.OrderNumber)
            .IsUnique();

        // OrderItem
        builder.Entity<OrderItem>()
            .Property(o => o.UnitPrice)
            .HasColumnType("decimal(18,2)");

        builder.Entity<OrderItem>()
            .Property(o => o.SubTotal)
            .HasColumnType("decimal(18,2)");

        // CartBasket
        builder.Entity<CartBasket>()
            .HasIndex(c => c.UserId)
            .IsUnique();

        builder.Entity<CartBasket>()
            .Property(c => c.DiscountAmount)
            .HasColumnType("decimal(18,2)");

        // One-to-one: Order -> ShippingAddress
        builder.Entity<ShippingAddress>()
            .HasOne(s => s.Order)
            .WithOne(o => o.ShippingAddress)
            .HasForeignKey<ShippingAddress>(s => s.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        // ProductVariant price adjustment
        builder.Entity<ProductVariant>()
            .Property(v => v.PriceAdjustment)
            .HasColumnType("decimal(18,2)");

        // AppUser -> CartBasket (one-to-one)
        builder.Entity<AppUser>()
            .HasOne(u => u.Cart)
            .WithOne(c => c.User)
            .HasForeignKey<CartBasket>(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Wishlist: composite unique constraint
        builder.Entity<WishlistItem>()
            .HasIndex(w => new { w.UserId, w.ProductId })
            .IsUnique();

        // BuyerProfile
        builder.Entity<BuyerProfile>()
            .HasIndex(b => b.Email);

        builder.Entity<BuyerProfile>()
            .Property(b => b.TotalSpent)
            .HasColumnType("decimal(18,2)");

        // Seed categories
        builder.Entity<Category>().HasData(
            new Category { Id = 1, Name = "Women's Collection", Slug = "womens-collection", Gender = GenderType.Women, IsActive = true, SortOrder = 1, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Category { Id = 2, Name = "Men's Collection", Slug = "mens-collection", Gender = GenderType.Men, IsActive = true, SortOrder = 2, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Category { Id = 3, Name = "Shalwar Kameez", Slug = "shalwar-kameez", Gender = GenderType.Women, ParentCategoryId = 1, IsActive = true, SortOrder = 1, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Category { Id = 4, Name = "Lawn Collection", Slug = "lawn-collection", Gender = GenderType.Women, ParentCategoryId = 1, IsActive = true, SortOrder = 2, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Category { Id = 5, Name = "Formal Wear", Slug = "formal-wear", Gender = GenderType.Women, ParentCategoryId = 1, IsActive = true, SortOrder = 3, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Category { Id = 6, Name = "Kurta Shalwar", Slug = "kurta-shalwar", Gender = GenderType.Men, ParentCategoryId = 2, IsActive = true, SortOrder = 1, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Category { Id = 7, Name = "Casual Wear", Slug = "casual-wear", Gender = GenderType.Men, ParentCategoryId = 2, IsActive = true, SortOrder = 2, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
        );
    }
}
