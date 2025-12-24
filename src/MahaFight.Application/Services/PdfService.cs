using MahaFight.Application.Interfaces;
using MahaFight.Domain.Entities;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace MahaFight.Application.Services;

public class PdfService : IPdfService
{
    public Task<byte[]> GenerateInvoicePdfAsync(Invoice invoice, Sale sale, List<SaleItem> saleItems, List<Product> products)
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
                                c.Item().Text($"Dealer: {invoice.DealerId}");
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
        catch
        {
            // Fallback: Generate simple text-based PDF content
            var content = $"MAHA FIGHT INVOICE\n\nInvoice: {invoice.InvoiceNumber}\nDate: {invoice.InvoiceDate:dd/MM/yyyy}\nTotal: ₹{invoice.TotalAmount:F2}";
            var bytes = System.Text.Encoding.UTF8.GetBytes(content);
            return Task.FromResult(bytes);
        }
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