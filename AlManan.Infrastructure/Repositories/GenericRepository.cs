using AlManan.Core.Entities;
using AlManan.Core.Helpers;
using AlManan.Core.Interfaces;
using AlManan.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AlManan.Infrastructure.Repositories;

/// <summary>
/// Generic repository implementation with EF Core
/// </summary>
public class GenericRepository<T> : IGenericRepository<T> where T : BaseEntity
{
    protected readonly AppDbContext _context;

    public GenericRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<T?> GetByIdAsync(int id)
        => await _context.Set<T>().FindAsync(id);

    public async Task<IReadOnlyList<T>> GetAllAsync()
        => await _context.Set<T>().ToListAsync();

    public async Task<PagedList<T>> GetAllPagedAsync(PaginationParams paginationParams)
    {
        var query = _context.Set<T>().AsQueryable();
        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((paginationParams.PageNumber - 1) * paginationParams.PageSize)
            .Take(paginationParams.PageSize)
            .ToListAsync();

        return new PagedList<T>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = paginationParams.PageNumber,
            PageSize = paginationParams.PageSize
        };
    }

    public async Task AddAsync(T entity) => await _context.Set<T>().AddAsync(entity);

    public void Update(T entity)
    {
        entity.UpdatedAt = DateTime.UtcNow;
        _context.Set<T>().Update(entity);
    }

    public void Delete(T entity) => _context.Set<T>().Remove(entity);

    public async Task<bool> SaveChangesAsync() => await _context.SaveChangesAsync() > 0;

    public async Task<bool> ExistsAsync(int id) => await _context.Set<T>().AnyAsync(e => e.Id == id);
}
