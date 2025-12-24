using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using MahaFight.Application.Interfaces;

namespace MahaFight.Application.Services;

public class CloudinaryService : ICloudinaryService
{
    private readonly Cloudinary _cloudinary;
    private readonly string[] _allowedImageTypes = { ".jpg", ".jpeg", ".png", ".webp" };
    private const long MaxImageSize = 2 * 1024 * 1024; // 2MB

    public CloudinaryService(IConfiguration configuration)
    {
        var account = new Account(
            configuration["Cloudinary:CloudName"],
            configuration["Cloudinary:ApiKey"],
            configuration["Cloudinary:ApiSecret"]
        );
        _cloudinary = new Cloudinary(account);
    }

    public async Task<(string ImageUrl, string PublicId)> UploadImageAsync(IFormFile file, string folder)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("No file provided");

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!_allowedImageTypes.Contains(extension))
            throw new ArgumentException("Invalid file type. Only JPG, PNG, and WEBP are allowed.");

        if (file.Length > MaxImageSize)
            throw new ArgumentException("File size exceeds 2MB limit.");

        using var stream = file.OpenReadStream();
        
        var uploadParams = new ImageUploadParams()
        {
            File = new FileDescription(file.FileName, stream),
            Folder = folder,
            PublicId = $"{Guid.NewGuid()}",
            Transformation = new Transformation().Quality("auto").FetchFormat("auto")
        };

        var uploadResult = await _cloudinary.UploadAsync(uploadParams);
        
        if (uploadResult.Error != null)
            throw new Exception($"Cloudinary upload failed: {uploadResult.Error.Message}");

        return (uploadResult.SecureUrl.ToString(), uploadResult.PublicId);
    }

    public async Task<bool> DeleteImageAsync(string publicId)
    {
        try
        {
            var deleteParams = new DeletionParams(publicId);
            var result = await _cloudinary.DestroyAsync(deleteParams);
            return result.Result == "ok";
        }
        catch
        {
            return false;
        }
    }
}