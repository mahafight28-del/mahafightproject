using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using MahaFight.Application.Interfaces;

namespace MahaFight.Application.Services;

public class FileUploadService : IFileUploadService
{
    private readonly string _uploadPath;
    private readonly string[] _allowedImageTypes = { ".jpg", ".jpeg", ".png", ".webp" };
    private const long MaxImageSize = 2 * 1024 * 1024; // 2MB

    public FileUploadService(IConfiguration configuration)
    {
        _uploadPath = configuration["FileUpload:Path"] ?? "uploads";
        Directory.CreateDirectory(_uploadPath);
    }

    public Task<string> UploadFileAsync(IFormFile file, string folder, string fileName)
    {
        var folderPath = Path.Combine(_uploadPath, folder);
        Directory.CreateDirectory(folderPath);

        var extension = Path.GetExtension(file.FileName);
        var fullFileName = $"{fileName}{extension}";
        var filePath = Path.Combine(folderPath, fullFileName);

        using var stream = new FileStream(filePath, FileMode.Create);
        file.CopyTo(stream);

        return Task.FromResult(Path.Combine(folder, fullFileName));
    }

    public async Task<string> UploadProductImageAsync(IFormFile file, Guid productId)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("No file provided");

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!_allowedImageTypes.Contains(extension))
            throw new ArgumentException("Invalid file type. Only JPG, PNG, and WEBP are allowed.");

        if (file.Length > MaxImageSize)
            throw new ArgumentException("File size exceeds 2MB limit.");

        var folder = "products";
        var fileName = $"{productId}_{Guid.NewGuid()}";
        
        var result = await UploadFileAsync(file, folder, fileName);
        return result.Replace('\\', '/');
    }

    public Task<bool> DeleteProductImageAsync(string fileName)
    {
        var filePath = Path.Combine("products", fileName);
        return DeleteFileAsync(filePath);
    }

    public Task<bool> DeleteFileAsync(string filePath)
    {
        try
        {
            var fullPath = Path.Combine(_uploadPath, filePath);
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
                return Task.FromResult(true);
            }
            return Task.FromResult(false);
        }
        catch
        {
            return Task.FromResult(false);
        }
    }
}