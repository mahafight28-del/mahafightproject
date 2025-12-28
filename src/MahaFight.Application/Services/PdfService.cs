using MahaFight.Application.Interfaces;
using MahaFight.Domain.Entities;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace MahaFight.Application.Services;

public class PdfService : IPdfService
{
    public Task<byte[]> GenerateInvoicePdfAsync(Invoice invoice, Sale sale, List<SaleItem> saleItems, List<Product> products, Dealer? dealer = null)
    {
        try
        {
            QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;
            
            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(20);
                    page.DefaultTextStyle(x => x.FontSize(12));

                    page.Header().Text(text =>
                    {
                        text.AlignCenter();
                        text.Line("MAHA FIGHT").SemiBold().FontSize(20);
                        text.Line("INVOICE").FontSize(16);
                    });

                    page.Content().Column(col =>
                    {
                        col.Item().Row(r =>
                        {
                            r.RelativeItem().Column(c =>
                            {
                                c.Item().Text($"Invoice Number: {invoice.InvoiceNumber}");
                                c.Item().Text($"Invoice Date: {invoice.InvoiceDate:dd/MM/yyyy}");
                                c.Item().Text($"Due Date: {invoice.DueDate:dd/MM/yyyy}");
                            });
                            r.ConstantItem(200).AlignRight().Column(c =>
                            {
                                c.Item().Text($"Dealer: {dealer?.BusinessName ?? "Unknown Dealer"}");
                            });
                        });

                        if (!string.IsNullOrEmpty(sale.CustomerName))
                        {
                            col.Item().PaddingTop(10).Text("Customer Details:").SemiBold();
                            col.Item().Text($"Name: {sale.CustomerName}");
                            if (!string.IsNullOrEmpty(sale.CustomerEmail)) col.Item().Text($"Email: {sale.CustomerEmail}");
                            if (!string.IsNullOrEmpty(sale.CustomerPhone)) col.Item().Text($"Phone: {sale.CustomerPhone}");
                        }

                        col.Item().PaddingTop(10).Element(e => BuildItemsTable(e, saleItems, products));

                        col.Item().PaddingTop(10).AlignRight().Column(c =>
                        {
                            c.Item().Text($"Subtotal: ₹{invoice.Subtotal:F2}");
                            c.Item().Text($"Tax: ₹{invoice.TaxAmount:F2}");
                            c.Item().Text($"Total: ₹{invoice.TotalAmount:F2}").SemiBold();
                        });
                    });

                    page.Footer().AlignCenter().Text(x => x.Line("Thank you for your business"));
                });
            });

            using var ms = new MemoryStream();
            document.GeneratePdf(ms);
            return Task.FromResult(ms.ToArray());
        }
        catch (Exception ex)
        {
            // Fallback: Generate HTML-based invoice
            var html = GenerateInvoiceHtml(invoice, sale, saleItems, products, dealer);
            var bytes = System.Text.Encoding.UTF8.GetBytes(html);
            return Task.FromResult(bytes);
        }
    }

    private string GenerateInvoiceHtml(Invoice invoice, Sale sale, List<SaleItem> saleItems, List<Product> products, Dealer? dealer)
    {
        var html = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        .header {{ text-align: center; margin-bottom: 30px; }}
        .company {{ font-size: 24px; font-weight: bold; }}
        .invoice-title {{ font-size: 18px; margin-top: 10px; }}
        .details {{ margin: 20px 0; }}
        .table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
        .table th, .table td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
        .table th {{ background-color: #f2f2f2; }}
        .total {{ text-align: right; margin-top: 20px; }}
        .footer {{ text-align: center; margin-top: 30px; }}
    </style>
</head>
<body>
    <div class='header'>
        <div class='company'>MAHA FIGHT</div>
        <div class='invoice-title'>INVOICE</div>
    </div>
    
    <div class='details'>
        <p><strong>Invoice Number:</strong> {invoice.InvoiceNumber}</p>
        <p><strong>Invoice Date:</strong> {invoice.InvoiceDate:dd/MM/yyyy}</p>
        <p><strong>Due Date:</strong> {invoice.DueDate:dd/MM/yyyy}</p>
        <p><strong>Dealer:</strong> {dealer?.BusinessName ?? "Unknown Dealer"}</p>
    </div>
    
    {(string.IsNullOrEmpty(sale.CustomerName) ? "" : $@"
    <div class='details'>
        <h3>Customer Details:</h3>
        <p><strong>Name:</strong> {sale.CustomerName}</p>
        {(string.IsNullOrEmpty(sale.CustomerEmail) ? "" : $"<p><strong>Email:</strong> {sale.CustomerEmail}</p>")}
        {(string.IsNullOrEmpty(sale.CustomerPhone) ? "" : $"<p><strong>Phone:</strong> {sale.CustomerPhone}</p>")}
    </div>
    ")}
    
    <table class='table'>
        <thead>
            <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>";

        foreach (var item in saleItems)
        {
            var product = products.FirstOrDefault(p => p.Id == item.ProductId);
            html += $@"
            <tr>
                <td>{product?.Name ?? "Unknown Product"}</td>
                <td>{item.Quantity}</td>
                <td>₹{item.UnitPrice:F2}</td>
                <td>₹{item.LineTotal:F2}</td>
            </tr>";
        }

        html += $@"
        </tbody>
    </table>
    
    <div class='total'>
        <p><strong>Subtotal: ₹{invoice.Subtotal:F2}</strong></p>
        <p><strong>Tax: ₹{invoice.TaxAmount:F2}</strong></p>
        <p style='font-size: 18px;'><strong>Total: ₹{invoice.TotalAmount:F2}</strong></p>
    </div>
    
    <div class='footer'>
        <p>Thank you for your business!</p>
    </div>
</body>
</html>";

        return html;
    }

    private void BuildItemsTable(IContainer container, List<SaleItem> saleItems, List<Product> products)
    {
        container.Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                columns.RelativeColumn(4);
                columns.ConstantColumn(60);
                columns.ConstantColumn(80);
                columns.ConstantColumn(80);
            });

            table.Header(header =>
            {
                header.Cell().Element(CellStyle).Text("Product");
                header.Cell().Element(CellStyle).AlignCenter().Text("Qty");
                header.Cell().Element(CellStyle).AlignRight().Text("Unit Price");
                header.Cell().Element(CellStyle).AlignRight().Text("Total");
            });

            foreach (var item in saleItems)
            {
                var product = products.FirstOrDefault(p => p.Id == item.ProductId);
                table.Cell().Element(CellStyle).Text(product?.Name ?? "Unknown Product");
                table.Cell().Element(CellStyle).AlignCenter().Text(item.Quantity.ToString());
                table.Cell().Element(CellStyle).AlignRight().Text($"₹{item.UnitPrice:F2}");
                table.Cell().Element(CellStyle).AlignRight().Text($"₹{item.LineTotal:F2}");
            }
        });
    }

    private static IContainer CellStyle(IContainer container)
    {
        return container.PaddingVertical(3).PaddingHorizontal(5);
    }
}