namespace MahaFight.Application.Interfaces;

public interface IQrCodeService
{
    Task<string> GenerateQrCodeAsync(string data, string fileName);
}