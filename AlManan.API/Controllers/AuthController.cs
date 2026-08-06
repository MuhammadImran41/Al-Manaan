using System.Security.Claims;
using AlManan.Core.DTOs.Auth;
using AlManan.Core.Entities;
using AlManan.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace AlManan.API.Controllers;

/// <summary>
/// Authentication controller handling register, login, and profile
/// </summary>
public class AuthController : BaseApiController
{
    private readonly UserManager<AppUser> _userManager;
    private readonly SignInManager<AppUser> _signInManager;
    private readonly ITokenService _tokenService;

    public AuthController(
        UserManager<AppUser> userManager,
        SignInManager<AppUser> signInManager,
        ITokenService tokenService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
    }

    /// <summary>Register a new customer account</summary>
    [HttpPost("register")]
    public async Task<ActionResult<UserResponseDto>> Register([FromBody] RegisterDto dto)
    {
        if (await _userManager.FindByEmailAsync(dto.Email) != null)
            return BadRequest(new { message = "Email is already registered" });

        var user = new AppUser
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            DisplayName = $"{dto.FirstName} {dto.LastName}",
            Email = dto.Email,
            UserName = dto.Email,
            PhoneNumber = dto.PhoneNumber
        };

        var result = await _userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

        await _userManager.AddToRoleAsync(user, "Customer");

        var token = await _tokenService.CreateTokenAsync(user);

        return Ok(new UserResponseDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email!,
            DisplayName = user.DisplayName,
            AvatarUrl = user.AvatarUrl,
            Token = token,
            Roles = new List<string> { "Customer" }
        });
    }

    /// <summary>Login with email and password</summary>
    [HttpPost("login")]
    public async Task<ActionResult<UserResponseDto>> Login([FromBody] LoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null) return Unauthorized(new { message = "Invalid email or password" });

        var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, false);
        if (!result.Succeeded) return Unauthorized(new { message = "Invalid email or password" });

        var roles = await _userManager.GetRolesAsync(user);
        var token = await _tokenService.CreateTokenAsync(user);

        return Ok(new UserResponseDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email!,
            DisplayName = user.DisplayName,
            AvatarUrl = user.AvatarUrl,
            Token = token,
            Roles = roles
        });
    }

    /// <summary>Get current authenticated user's profile</summary>
    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserResponseDto>> GetCurrentUser()
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        var user = await _userManager.FindByEmailAsync(email!);

        if (user == null) return Unauthorized();

        var roles = await _userManager.GetRolesAsync(user);
        var token = await _tokenService.CreateTokenAsync(user);

        return Ok(new UserResponseDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email!,
            DisplayName = user.DisplayName,
            AvatarUrl = user.AvatarUrl,
            Token = token,
            Roles = roles
        });
    }

    /// <summary>Check if an email address is already taken</summary>
    [HttpGet("emailexists")]
    public async Task<ActionResult<bool>> CheckEmailExists([FromQuery] string email)
    {
        return await _userManager.FindByEmailAsync(email) != null;
    }
}
