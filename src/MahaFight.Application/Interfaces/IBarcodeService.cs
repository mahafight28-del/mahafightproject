namespace MahaFight.Application.Interfaces;

public interface IBarcodeService
{
    Task<string> GenerateBarcodeAsync(string data, string fileName);
}