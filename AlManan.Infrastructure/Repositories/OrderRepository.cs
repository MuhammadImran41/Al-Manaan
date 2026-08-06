using AlManan.Core.Entities;
using AlManan.Core.Helpers;
using AlManan.Core.Interfaces;
using AlManan.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AlManan.Infrastructure.Repositories;

/// <summary>
/// Order repository with full order detail support
/// </summary>
public class OrderRepository : GenericRepository<Order>, IOrderRepository
{
    public OrderRepository(AppDbContext context) : base(context) { }

    public async Task<Order?> GetOrderWithDetailsAsync(int id)
        => await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(i => i.Product)
            .Include(o => o.ShippingAddress)
            .Include(o => o.User)
            .FirstOrDefaultAsync(o => o.Id == id);

    public async Task<IReadOnlyList<Order>> GetUserOrdersAsync(string userId)
        => await _context.Orders
            .Include(o => o.OrderItems)
            .Include(o => o.ShippingAddress)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

    public async Task<PagedList<Order>> GetAllOrdersAsync(PaginationParams paginationParams)
    {
        var query = _context.Orders
            .Include(o => o.User)
            .Include(o => o.ShippingAddress)
            .OrderByDescending(o => o.CreatedAt)
            .AsQueryable();

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((paginationParams.PageNumber - 1) * paginationParams.PageSize)
            .Take(paginationParams.PageSize)
            .ToListAsync();

        return new PagedList<Order>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = paginationParams.PageNumber,
            PageSize = paginationParams.PageSize
        };
    }

    public async Task<Order?> GetOrderByOrderNumberAsync(string orderNumber)
        => await _context.Orders
            .Include(o => o.OrderItems)
            .Include(o => o.ShippingAddress)
            .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber);

    public string GenerateOrderNumber()
        => $"AM-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
}
