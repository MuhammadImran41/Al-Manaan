using Microsoft.AspNetCore.Http;

namespace AlManan.Core.Interfaces;

/// <summary>
/// Photo upload service interface (Cloudinary)
/// </summary>
public interface IPhotoService
{
    Task<PhotoUploadResult> UploadPhotoAsync(IFormFile file, string folder = "al-manan/products");
    Task<bool> DeletePhotoAsync(string publicId);
}

public class PhotoUploadResult
{
    public string PublicId { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public bool Success { get; set; }
    public string? Error { get; set; }
}
