using AlManan.Core.Entities;
using AlManan.Core.Helpers;

namespace AlManan.Core.Interfaces;

/// <summary>
/// Order-specific repository interface
/// </summary>
public interface IOrderRepository : IGenericRepository<Order>
{
    Task<Order?> GetOrderWithDetailsAsync(int id);
    Task<IReadOnlyList<Order>> GetUserOrdersAsync(string userId);
    Task<PagedList<Order>> GetAllOrdersAsync(PaginationParams paginationParams);
    Task<Order?> GetOrderByOrderNumberAsync(string orderNumber);
    string GenerateOrderNumber();
}
