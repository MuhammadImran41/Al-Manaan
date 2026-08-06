namespace AlManan.Core.Helpers;

/// <summary>
/// Query parameters for pagination
/// </summary>
public class PaginationParams
{
    private const int MaxPageSize = 50;
    private int _pageSize = 12;

    public int PageNumber { get; set; } = 1;

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value > MaxPageSize ? MaxPageSize : value;
    }
}

/// <summary>
/// Paginated result list with metadata
/// </summary>
public class PagedList<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;
}
