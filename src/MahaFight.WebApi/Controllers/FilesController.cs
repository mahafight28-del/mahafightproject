using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace MahaFight.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FilesController : ControllerBase
{
    private readonly string _uploadPath;

    public FilesController(IConfiguration configuration)
    {
        _uploadPath = configuration["FileUpload:Path"] ?? "uploads";
    }

    [HttpGet("{folder}/{fileName}")]
    public IActionResult GetFile(string folder, string fileName)
    {
        var filePath = Path.Combine(_uploadPath, folder, fileName);
        
        if (!System.IO.File.Exists(filePath))
            return NotFound();

        var contentType = GetContentType(fileName);
        var fileBytes = System.IO.File.ReadAllBytes(filePath);
        
        return File(fileBytes, contentType);
    }

    private static string GetContentType(string fileName)
    {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        return extension switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".webp" => "image/webp",
            _ => "application/octet-stream"
        };
    }
}