using System.Text;
using MahaFight.Domain.Entities;

namespace MahaFight.Application.Services;

public interface ICsvExportService
{
    byte[] ExportDealers(IEnumerable<Dealer> dealers);
    byte[] ExportProducts(IEnumerable<Product> products);
    byte[] ExportSales(IEnumerable<Sale> sales);
    byte[] ExportCommissions(IEnumerable<Commission> commissions);
    byte[] ExportInvoices(IEnumerable<Invoice> invoices);
}

public class CsvExportService : ICsvExportService
{
    public byte[] ExportDealers(IEnumerable<Dealer> dealers)
    {
        var csv = new StringBuilder();
        csv.AppendLine("Id,BusinessName,Email,Phone,Address,City,State,Status,CommissionRate,CreatedAt");
        
        foreach (var dealer in dealers)
        {
            csv.AppendLine($"{dealer.Id},{EscapeCsv(dealer.BusinessName)},{EscapeCsv(dealer.User?.Email ?? "")},{EscapeCsv(dealer.User?.Phone ?? "")},{EscapeCsv(dealer.Address)},{EscapeCsv(dealer.City)},{EscapeCsv(dealer.State)},{dealer.Status},{dealer.CommissionRate},{dealer.CreatedAt:yyyy-MM-dd HH:mm:ss}");
        }
        
        return Encoding.UTF8.GetBytes(csv.ToString());
    }

    public byte[] ExportProducts(IEnumerable<Product> products)
    {
        var csv = new StringBuilder();
        csv.AppendLine("Id,SKU,Name,Category,Brand,UnitPrice,CostPrice,StockQuantity,IsActive,CreatedAt");
        
        foreach (var product in products)
        {
            csv.AppendLine($"{product.Id},{EscapeCsv(product.Sku)},{EscapeCsv(product.Name)},{EscapeCsv(product.Category)},{EscapeCsv(product.Brand ?? "")},{product.UnitPrice},{product.CostPrice},{product.StockQuantity},{product.IsActive},{product.CreatedAt:yyyy-MM-dd HH:mm:ss}");
        }
        
        return Encoding.UTF8.GetBytes(csv.ToString());
    }

    public byte[] ExportSales(IEnumerable<Sale> sales)
    {
        var csv = new StringBuilder();
        csv.AppendLine("Id,SaleNumber,DealerName,CustomerName,SaleDate,Subtotal,TaxAmount,TotalAmount,PaymentStatus");
        
        foreach (var sale in sales)
        {
            csv.AppendLine($"{sale.Id},{EscapeCsv(sale.SaleNumber)},{EscapeCsv(sale.Dealer?.BusinessName ?? "")},{EscapeCsv(sale.CustomerName ?? "")},{sale.SaleDate:yyyy-MM-dd HH:mm:ss},{sale.Subtotal},{sale.TaxAmount},{sale.TotalAmount},{sale.PaymentStatus}");
        }
        
        return Encoding.UTF8.GetBytes(csv.ToString());
    }

    public byte[] ExportCommissions(IEnumerable<Commission> commissions)
    {
        var csv = new StringBuilder();
        csv.AppendLine("Id,DealerName,SaleNumber,CommissionRate,SaleAmount,CommissionAmount,CommissionDate,PaymentStatus");
        
        foreach (var commission in commissions)
        {
            csv.AppendLine($"{commission.Id},{EscapeCsv(commission.Dealer?.BusinessName ?? "")},{EscapeCsv(commission.Sale?.SaleNumber ?? "")},{commission.CommissionRate},{commission.SaleAmount},{commission.CommissionAmount},{commission.CommissionDate:yyyy-MM-dd HH:mm:ss},{commission.PaymentStatus}");
        }
        
        return Encoding.UTF8.GetBytes(csv.ToString());
    }

    public byte[] ExportInvoices(IEnumerable<Invoice> invoices)
    {
        var csv = new StringBuilder();
        csv.AppendLine("Id,InvoiceNumber,DealerName,InvoiceDate,DueDate,TotalAmount,PaidAmount,BalanceAmount,Status");
        
        foreach (var invoice in invoices)
        {
            csv.AppendLine($"{invoice.Id},{EscapeCsv(invoice.InvoiceNumber)},{EscapeCsv(invoice.Dealer?.BusinessName ?? "")},{invoice.InvoiceDate:yyyy-MM-dd HH:mm:ss},{invoice.DueDate:yyyy-MM-dd HH:mm:ss},{invoice.TotalAmount},{invoice.PaidAmount},{invoice.BalanceAmount},{invoice.Status}");
        }
        
        return Encoding.UTF8.GetBytes(csv.ToString());
    }

    private static string EscapeCsv(string value)
    {
        if (string.IsNullOrEmpty(value)) return "";
        
        if (value.Contains(',') || value.Contains('"') || value.Contains('\n'))
        {
            return $"\"{value.Replace("\"", "\"\"")}\"";
        }
        
        return value;
    }
}