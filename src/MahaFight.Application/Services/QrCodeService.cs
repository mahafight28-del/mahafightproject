using QRCoder;
using Microsoft.Extensions.Configuration;
using MahaFight.Application.Interfaces;

namespace MahaFight.Application.Services;

public class QrCodeService : IQrCodeService
{
    private readonly string _qrCodePath;

    public QrCodeService(IConfiguration configuration)
    {
        _qrCodePath = Path.Combine(configuration["FileUpload:Path"] ?? "uploads", "qrcodes");
        Directory.CreateDirectory(_qrCodePath);
    }

    public Task<string> GenerateQrCodeAsync(string data, string fileName)
    {
        using var qrGenerator = new QRCodeGenerator();
        using var qrCodeData = qrGenerator.CreateQrCode(data, QRCodeGenerator.ECCLevel.Q);
        using var qrCode = new PngByteQRCode(qrCodeData);
        var qrCodeBytes = qrCode.GetGraphic(20);
        
        var filePath = Path.Combine(_qrCodePath, $"{fileName}.png");
        File.WriteAllBytes(filePath, qrCodeBytes);
        
        return Task.FromResult(Path.Combine("qrcodes", $"{fileName}.png"));
    }
}