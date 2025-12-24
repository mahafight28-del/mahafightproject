using MahaFight.Domain.Entities;

namespace MahaFight.Application.Interfaces;

public interface IPdfService
{
    Task<byte[]> GenerateInvoicePdfAsync(Invoice invoice, Sale sale, List<SaleItem> saleItems, List<Product> products);
}