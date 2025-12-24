using Microsoft.AspNetCore.Http;

namespace MahaFight.Application.Interfaces;

public interface ICloudinaryService
{
    Task<(string ImageUrl, string PublicId)> UploadImageAsync(IFormFile file, string folder);
    Task<bool> DeleteImageAsync(string publicId);
}