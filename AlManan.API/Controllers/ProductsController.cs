using AlManan.Core.DTOs.Product;
using AlManan.Core.Entities;
using AlManan.Core.Helpers;
using AlManan.Core.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AlManan.API.Controllers;

/// <summary>
/// Products CRUD and browsing controller
/// </summary>
public class ProductsController : BaseApiController
{
    private readonly IProductRepository _productRepo;
    private readonly IGenericRepository<Category> _categoryRepo;
    private readonly IPhotoService _photoService;
    private readonly IMapper _mapper;

    public ProductsController(
        IProductRepository productRepo,
        IGenericRepository<Category> categoryRepo,
        IPhotoService photoService,
        IMapper mapper)
    {
        _productRepo = productRepo;
        _categoryRepo = categoryRepo;
        _photoService = photoService;
        _mapper = mapper;
    }

    /// <summary>Get all products with filters and pagination</summary>
    [HttpGet]
    public async Task<ActionResult> GetProducts([FromQuery] ProductQueryParams queryParams)
    {
        var result = await _productRepo.GetProductsAsync(queryParams);

        Response.Headers.Append("X-Pagination-TotalCount", result.TotalCount.ToString());
        Response.Headers.Append("X-Pagination-TotalPages", result.TotalPages.ToString());
        Response.Headers.Append("X-Pagination-CurrentPage", result.PageNumber.ToString());
        Response.Headers.Append("Access-Control-Expose-Headers", "X-Pagination-TotalCount, X-Pagination-TotalPages, X-Pagination-CurrentPage");

        return Ok(new
        {
            items = _mapper.Map<List<ProductDto>>(result.Items),
            totalCount = result.TotalCount,
            totalPages = result.TotalPages,
            currentPage = result.PageNumber,
            pageSize = result.PageSize,
            hasPreviousPage = result.HasPreviousPage,
            hasNextPage = result.HasNextPage
        });
    }

    /// <summary>Get a single product by ID</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductDto>> GetProduct(int id)
    {
        var product = await _productRepo.GetProductWithDetailsAsync(id);
        if (product == null) return NotFound(new { message = "Product not found" });
        return Ok(_mapper.Map<ProductDto>(product));
    }

    /// <summary>Get product by slug (for SEO-friendly URLs)</summary>
    [HttpGet("{slug}")]
    public async Task<ActionResult<ProductDto>> GetProductBySlug(string slug)
    {
        var product = await _productRepo.GetProductBySlugAsync(slug);
        if (product == null) return NotFound(new { message = "Product not found" });
        return Ok(_mapper.Map<ProductDto>(product));
    }

    /// <summary>Get featured products for homepage</summary>
    [HttpGet("featured")]
    public async Task<ActionResult<List<ProductDto>>> GetFeatured([FromQuery] int count = 8)
    {
        var products = await _productRepo.GetFeaturedProductsAsync(count);
        return Ok(_mapper.Map<List<ProductDto>>(products));
    }

    /// <summary>Get best-selling products</summary>
    [HttpGet("best-sellers")]
    public async Task<ActionResult<List<ProductDto>>> GetBestSellers([FromQuery] int count = 8)
    {
        var products = await _productRepo.GetBestSellersAsync(count);
        return Ok(_mapper.Map<List<ProductDto>>(products));
    }

    /// <summary>Get new arrivals</summary>
    [HttpGet("new-arrivals")]
    public async Task<ActionResult<List<ProductDto>>> GetNewArrivals([FromQuery] int count = 8)
    {
        var products = await _productRepo.GetNewArrivalsAsync(count);
        return Ok(_mapper.Map<List<ProductDto>>(products));
    }

    /// <summary>Get related products for a product</summary>
    [HttpGet("{id:int}/related")]
    public async Task<ActionResult<List<ProductDto>>> GetRelated(int id, [FromQuery] int count = 4)
    {
        var products = await _productRepo.GetRelatedProductsAsync(id, count);
        return Ok(_mapper.Map<List<ProductDto>>(products));
    }

    /// <summary>Search products by name/description/SKU</summary>
    [HttpGet("search")]
    public async Task<ActionResult<List<ProductDto>>> Search([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q))
            return BadRequest(new { message = "Search query cannot be empty" });

        var products = await _productRepo.SearchProductsAsync(q);
        return Ok(_mapper.Map<List<ProductDto>>(products));
    }

    /// <summary>Get all product categories</summary>
    [HttpGet("categories")]
    public async Task<ActionResult> GetCategories()
    {
        var categories = await _categoryRepo.GetAllAsync();
        return Ok(categories.Select(c => new
        {
            c.Id,
            c.Name,
            c.Slug,
            c.Description,
            c.ImageUrl,
            Gender = c.Gender.ToString(),
            c.ParentCategoryId,
            c.SortOrder,
            c.IsActive
        }));
    }

    // ---- Admin-only endpoints ----

    /// <summary>Create a new product (Admin only)</summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpPost]
    public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] ProductCreateDto dto)
    {
        if (!await _categoryRepo.ExistsAsync(dto.CategoryId))
            return BadRequest(new { message = "Invalid category" });

        var product = _mapper.Map<Product>(dto);
        await _productRepo.AddAsync(product);
        await _productRepo.SaveChangesAsync();

        var result = await _productRepo.GetProductWithDetailsAsync(product.Id);
        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, _mapper.Map<ProductDto>(result));
    }

    /// <summary>Update a product (Admin only)</summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProductDto>> UpdateProduct(int id, [FromBody] ProductUpdateDto dto)
    {
        var product = await _productRepo.GetProductWithDetailsAsync(id);
        if (product == null) return NotFound(new { message = "Product not found" });

        _mapper.Map(dto, product);
        _productRepo.Update(product);
        await _productRepo.SaveChangesAsync();

        return Ok(_mapper.Map<ProductDto>(await _productRepo.GetProductWithDetailsAsync(id)));
    }

    /// <summary>Delete a product (Admin only)</summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteProduct(int id)
    {
        var product = await _productRepo.GetByIdAsync(id);
        if (product == null) return NotFound(new { message = "Product not found" });

        _productRepo.Delete(product);
        await _productRepo.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>Upload product image (Admin only)</summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpPost("{id:int}/images")]
    public async Task<ActionResult> UploadImage(int id, IFormFile file, [FromQuery] bool isMain = false)
    {
        var product = await _productRepo.GetProductWithDetailsAsync(id);
        if (product == null) return NotFound(new { message = "Product not found" });

        var uploadResult = await _photoService.UploadPhotoAsync(file);
        if (!uploadResult.Success)
            return BadRequest(new { message = uploadResult.Error });

        var image = new ProductImage
        {
            ImageUrl = uploadResult.Url,
            PublicId = uploadResult.PublicId,
            IsMain = isMain || !product.Images.Any(),
            ProductId = id
        };

        if (image.IsMain)
            product.Images.ToList().ForEach(i => i.IsMain = false);

        product.Images.Add(image);
        await _productRepo.SaveChangesAsync();

        return Ok(new { image.Id, image.ImageUrl, image.IsMain });
    }

    /// <summary>Toggle sold out status (Admin only)</summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpPatch("{id:int}/sold-out")]
    public async Task<ActionResult> ToggleSoldOut(int id, [FromBody] SoldOutDto dto)
    {
        var product = await _productRepo.GetByIdAsync(id);
        if (product == null) return NotFound(new { message = "Product not found" });
        product.IsSoldOut = dto.IsSoldOut;
        product.UpdatedAt = DateTime.UtcNow;
        _productRepo.Update(product);
        await _productRepo.SaveChangesAsync();
        return Ok(new { product.Id, product.IsSoldOut });
    }

    /// <summary>Add product image by URL (Admin only)</summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpPost("{id:int}/images/url")]
    public async Task<ActionResult> AddImageByUrl(int id, [FromBody] ProductImageUrlDto dto)
    {
        var product = await _productRepo.GetProductWithDetailsAsync(id);
        if (product == null) return NotFound(new { message = "Product not found" });

        if (dto.IsMain)
            product.Images.ToList().ForEach(i => i.IsMain = false);

        var image = new ProductImage
        {
            ImageUrl  = dto.ImageUrl,
            IsMain    = dto.IsMain || !product.Images.Any(),
            SortOrder = dto.SortOrder,
            ProductId = id
        };

        product.Images.Add(image);
        await _productRepo.SaveChangesAsync();

        return Ok(new { image.Id, image.ImageUrl, image.IsMain });
    }
}
