using AlManan.Core.Interfaces;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace AlManan.Infrastructure.Services;

/// <summary>
/// Cloudinary image upload service
/// </summary>
public class PhotoService : IPhotoService
{
    private readonly Cloudinary _cloudinary;

    public PhotoService(IConfiguration config)
    {
        var account = new Account(
            config["Cloudinary:CloudName"],
            config["Cloudinary:ApiKey"],
            config["Cloudinary:ApiSecret"]
        );
        _cloudinary = new Cloudinary(account);
    }

    public async Task<PhotoUploadResult> UploadPhotoAsync(IFormFile file, string folder = "al-manan/products")
    {
        if (file == null || file.Length == 0)
            return new PhotoUploadResult { Success = false, Error = "No file provided" };

        await using var stream = file.OpenReadStream();

        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(file.FileName, stream),
            Folder = folder,
            Transformation = new Transformation()
                .Width(800)
                .Height(1000)
                .Crop("limit")
                .Quality("auto")
                .FetchFormat("auto")
        };

        var result = await _cloudinary.UploadAsync(uploadParams);

        if (result.Error != null)
            return new PhotoUploadResult { Success = false, Error = result.Error.Message };

        return new PhotoUploadResult
        {
            Success = true,
            PublicId = result.PublicId,
            Url = result.SecureUrl.ToString()
        };
    }

    public async Task<bool> DeletePhotoAsync(string publicId)
    {
        var deleteParams = new DeletionParams(publicId);
        var result = await _cloudinary.DestroyAsync(deleteParams);
        return result.Result == "ok";
    }
}
