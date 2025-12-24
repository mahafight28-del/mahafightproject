using Microsoft.AspNetCore.Http;

namespace MahaFight.Application.Interfaces;

public interface IFileUploadService
{
    Task<string> UploadFileAsync(IFormFile file, string folder, string fileName);
    Task<bool> DeleteFileAsync(string filePath);
    Task<string> UploadProductImageAsync(IFormFile file, Guid productId);
    Task<bool> DeleteProductImageAsync(string fileName);
}