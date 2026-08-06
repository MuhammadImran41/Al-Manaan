using AlManan.Core.Entities;
using AlManan.Core.Helpers;
using AlManan.Core.Interfaces;
using AlManan.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AlManan.Infrastructure.Repositories;

/// <summary>
/// Product repository with full filtering and pagination support
/// </summary>
public class ProductRepository : GenericRepository<Product>, IProductRepository
{
    public ProductRepository(AppDbContext context) : base(context) { }

    public async Task<Product?> GetProductWithDetailsAsync(int id)
        => await _context.Products
            .Include(p => p.Images)
            .Include(p => p.Variants)
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id);

    public async Task<Product?> GetProductBySlugAsync(string slug)
        => await _context.Products
            .Include(p => p.Images)
            .Include(p => p.Variants)
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Slug == slug);

    public async Task<PagedList<Product>> GetProductsAsync(ProductQueryParams queryParams)
    {
        var query = _context.Products
            .Include(p => p.Images.Where(i => i.IsMain))
            .Include(p => p.Category)
            .Where(p => p.IsActive)
            .AsQueryable();

        // Apply filters
        if (queryParams.CategoryId.HasValue)
            query = query.Where(p => p.CategoryId == queryParams.CategoryId.Value ||
                                     p.Category!.ParentCategoryId == queryParams.CategoryId.Value);

        if (!string.IsNullOrEmpty(queryParams.Gender))
        {
            var gender = queryParams.Gender.ToLower() switch
            {
                "men" => GenderType.Men,
                "women" => GenderType.Women,
                "kids" => GenderType.Kids,
                _ => GenderType.Unisex
            };
            query = query.Where(p => p.Category!.Gender == gender || p.Category!.Gender == GenderType.Unisex);
        }

        if (queryParams.MinPrice.HasValue)
            query = query.Where(p => p.Price >= queryParams.MinPrice.Value);

        if (queryParams.MaxPrice.HasValue)
            query = query.Where(p => p.Price <= queryParams.MaxPrice.Value);

        if (!string.IsNullOrEmpty(queryParams.Size))
            query = query.Where(p => p.Variants.Any(v => v.Size == queryParams.Size && v.StockQuantity > 0));

        if (queryParams.IsFeatured.HasValue)
            query = query.Where(p => p.IsFeatured == queryParams.IsFeatured.Value);

        if (queryParams.IsBestSeller.HasValue)
            query = query.Where(p => p.IsBestSeller == queryParams.IsBestSeller.Value);

        if (queryParams.IsNew.HasValue)
            query = query.Where(p => p.IsNew == queryParams.IsNew.Value);

        if (!string.IsNullOrEmpty(queryParams.Search))
        {
            var search = queryParams.Search.ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(search) ||
                p.Description.ToLower().Contains(search) ||
                p.SKU.ToLower().Contains(search));
        }

        // Apply sorting
        query = queryParams.SortBy?.ToLower() switch
        {
            "price_asc" => query.OrderBy(p => p.SalePrice ?? p.Price),
            "price_desc" => query.OrderByDescending(p => p.SalePrice ?? p.Price),
            "popular" => query.OrderByDescending(p => p.ReviewCount),
            "rating" => query.OrderByDescending(p => p.AverageRating),
            _ => query.OrderByDescending(p => p.CreatedAt)  // newest
        };

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((queryParams.PageNumber - 1) * queryParams.PageSize)
            .Take(queryParams.PageSize)
            .ToListAsync();

        return new PagedList<Product>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = queryParams.PageNumber,
            PageSize = queryParams.PageSize
        };
    }

    public async Task<IReadOnlyList<Product>> GetFeaturedProductsAsync(int count = 8)
        => await _context.Products
            .Include(p => p.Images.Where(i => i.IsMain))
            .Include(p => p.Category)
            .Where(p => p.IsActive && p.IsFeatured)
            .OrderByDescending(p => p.CreatedAt)
            .Take(count)
            .ToListAsync();

    public async Task<IReadOnlyList<Product>> GetBestSellersAsync(int count = 8)
        => await _context.Products
            .Include(p => p.Images.Where(i => i.IsMain))
            .Include(p => p.Category)
            .Where(p => p.IsActive && p.IsBestSeller)
            .OrderByDescending(p => p.ReviewCount)
            .Take(count)
            .ToListAsync();

    public async Task<IReadOnlyList<Product>> GetNewArrivalsAsync(int count = 8)
        => await _context.Products
            .Include(p => p.Images.Where(i => i.IsMain))
            .Include(p => p.Category)
            .Where(p => p.IsActive && p.IsNew)
            .OrderByDescending(p => p.CreatedAt)
            .Take(count)
            .ToListAsync();

    public async Task<IReadOnlyList<Product>> GetRelatedProductsAsync(int productId, int count = 4)
    {
        var product = await _context.Products.FindAsync(productId);
        if (product == null) return new List<Product>();

        return await _context.Products
            .Include(p => p.Images.Where(i => i.IsMain))
            .Where(p => p.CategoryId == product.CategoryId && p.Id != productId && p.IsActive)
            .OrderByDescending(p => p.IsFeatured)
            .Take(count)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<Product>> SearchProductsAsync(string query)
    {
        var search = query.ToLower();
        return await _context.Products
            .Include(p => p.Images.Where(i => i.IsMain))
            .Include(p => p.Category)
            .Where(p => p.IsActive && (
                p.Name.ToLower().Contains(search) ||
                p.Description.ToLower().Contains(search) ||
                p.SKU.ToLower().Contains(search) ||
                p.Category!.Name.ToLower().Contains(search)))
            .Take(20)
            .ToListAsync();
    }
}
