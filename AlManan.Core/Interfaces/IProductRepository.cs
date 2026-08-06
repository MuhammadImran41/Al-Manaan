using AlManan.Core.Entities;
using AlManan.Core.Helpers;

namespace AlManan.Core.Interfaces;

/// <summary>
/// Product-specific repository interface
/// </summary>
public interface IProductRepository : IGenericRepository<Product>
{
    Task<Product?> GetProductWithDetailsAsync(int id);
    Task<Product?> GetProductBySlugAsync(string slug);
    Task<PagedList<Product>> GetProductsAsync(ProductQueryParams queryParams);
    Task<IReadOnlyList<Product>> GetFeaturedProductsAsync(int count = 8);
    Task<IReadOnlyList<Product>> GetBestSellersAsync(int count = 8);
    Task<IReadOnlyList<Product>> GetNewArrivalsAsync(int count = 8);
    Task<IReadOnlyList<Product>> GetRelatedProductsAsync(int productId, int count = 4);
    Task<IReadOnlyList<Product>> SearchProductsAsync(string query);
}
