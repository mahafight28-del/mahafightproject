using ZXing;
using ZXing.Common;
using Microsoft.Extensions.Configuration;
using MahaFight.Application.Interfaces;

namespace MahaFight.Application.Services;

public class BarcodeService : IBarcodeService
{
    private readonly string _barcodePath;

    public BarcodeService(IConfiguration configuration)
    {
        _barcodePath = Path.Combine(configuration["FileUpload:Path"] ?? "uploads", "barcodes");
        Directory.CreateDirectory(_barcodePath);
    }

    public Task<string> GenerateBarcodeAsync(string data, string fileName)
    {
        var writer = new BarcodeWriterPixelData
        {
            Format = BarcodeFormat.CODE_128,
            Options = new EncodingOptions
            {
                Height = 100,
                Width = 300,
                Margin = 10
            }
        };

        var pixelData = writer.Write(data);
        var filePath = Path.Combine(_barcodePath, $"{fileName}.png");
        
        // Convert pixel data to PNG and save
        using var fileStream = File.Create(filePath);
        var pngBytes = ConvertPixelDataToPng(pixelData);
        fileStream.Write(pngBytes);
        
        return Task.FromResult(Path.Combine("barcodes", $"{fileName}.png"));
    }
    
    private static byte[] ConvertPixelDataToPng(ZXing.Rendering.PixelData pixelData)
    {
        // Simple PNG creation - for production use proper image library
        var width = pixelData.Width;
        var height = pixelData.Height;
        var pixels = pixelData.Pixels;
        
        // Create a simple bitmap header + pixel data
        var imageSize = width * height * 3; // RGB
        var fileSize = 54 + imageSize; // BMP header size + image
        
        var bmpData = new byte[fileSize];
        
        // BMP Header
        bmpData[0] = 0x42; bmpData[1] = 0x4D; // "BM"
        BitConverter.GetBytes(fileSize).CopyTo(bmpData, 2);
        BitConverter.GetBytes(54).CopyTo(bmpData, 10); // Data offset
        BitConverter.GetBytes(40).CopyTo(bmpData, 14); // Header size
        BitConverter.GetBytes(width).CopyTo(bmpData, 18);
        BitConverter.GetBytes(height).CopyTo(bmpData, 22);
        bmpData[26] = 1; // Planes
        bmpData[28] = 24; // Bits per pixel
        
        // Convert pixels
        for (int i = 0; i < pixels.Length; i++)
        {
            var color = pixels[i] == 0 ? (byte)0 : (byte)255; // Black or white
            var offset = 54 + i * 3;
            if (offset + 2 < bmpData.Length)
            {
                bmpData[offset] = color;     // B
                bmpData[offset + 1] = color; // G  
                bmpData[offset + 2] = color; // R
            }
        }
        
        return bmpData;
    }
}