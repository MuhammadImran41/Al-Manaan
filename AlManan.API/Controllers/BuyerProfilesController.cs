using AlManan.Core.DTOs;
using AlManan.Core.Entities;
using AlManan.Core.Helpers;
using AlManan.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AlManan.API.Controllers;

/// <summary>
/// Buyer Profile management — Admin only
/// </summary>
[Authorize(Policy = "AdminOnly")]
public class BuyerProfilesController : BaseApiController
{
    private readonly AppDbContext _context;

    public BuyerProfilesController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>Get all buyer profiles with pagination + search</summary>
    [HttpGet]
    public async Task<ActionResult> GetAll(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize   = 20,
        [FromQuery] string? search = null)
    {
        var query = _context.BuyerProfiles.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            query = query.Where(b =>
                b.FullName.ToLower().Contains(s) ||
                b.Email.ToLower().Contains(s)    ||
                b.Phone.Contains(s)              ||
                b.City.ToLower().Contains(s));
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(b => b.LastOrderAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(b => new BuyerProfileDto
            {
                Id          = b.Id,
                FullName    = b.FullName,
                Email       = b.Email,
                Phone       = b.Phone,
                City        = b.City,
                Province    = b.Province,
                Street      = b.Street,
                PostalCode  = b.PostalCode,
                Country     = b.Country,
                TotalOrders = b.TotalOrders,
                TotalSpent  = b.TotalSpent,
                LastOrderAt = b.LastOrderAt,
                UserId      = b.UserId,
                CreatedAt   = b.CreatedAt
            })
            .ToListAsync();

        return Ok(new
        {
            items,
            totalCount  = total,
            totalPages  = (int)Math.Ceiling((double)total / pageSize),
            currentPage = pageNumber,
            pageSize
        });
    }

    /// <summary>Get single buyer profile by ID</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<BuyerProfileDto>> GetById(int id)
    {
        var b = await _context.BuyerProfiles.FindAsync(id);
        if (b == null) return NotFound(new { message = "Buyer profile not found" });

        return Ok(new BuyerProfileDto
        {
            Id = b.Id, FullName = b.FullName, Email = b.Email,
            Phone = b.Phone, City = b.City, Province = b.Province,
            Street = b.Street, PostalCode = b.PostalCode, Country = b.Country,
            TotalOrders = b.TotalOrders, TotalSpent = b.TotalSpent,
            LastOrderAt = b.LastOrderAt, UserId = b.UserId, CreatedAt = b.CreatedAt
        });
    }

    /// <summary>Delete a buyer profile</summary>
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id)
    {
        var b = await _context.BuyerProfiles.FindAsync(id);
        if (b == null) return NotFound(new { message = "Buyer profile not found" });

        _context.BuyerProfiles.Remove(b);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
