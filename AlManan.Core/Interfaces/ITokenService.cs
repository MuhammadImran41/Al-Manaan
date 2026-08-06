using AlManan.Core.Entities;

namespace AlManan.Core.Interfaces;

/// <summary>
/// JWT token service interface
/// </summary>
public interface ITokenService
{
    Task<string> CreateTokenAsync(AppUser user);
}
