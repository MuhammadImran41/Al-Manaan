using AlManan.Core.Entities;
using AlManan.Core.Helpers;

namespace AlManan.Core.Interfaces;

/// <summary>
/// Generic repository interface for CRUD operations
/// </summary>
public interface IGenericRepository<T> where T : BaseEntity
{
    Task<T?> GetByIdAsync(int id);
    Task<IReadOnlyList<T>> GetAllAsync();
    Task<PagedList<T>> GetAllPagedAsync(PaginationParams paginationParams);
    Task AddAsync(T entity);
    void Update(T entity);
    void Delete(T entity);
    Task<bool> SaveChangesAsync();
    Task<bool> ExistsAsync(int id);
}
