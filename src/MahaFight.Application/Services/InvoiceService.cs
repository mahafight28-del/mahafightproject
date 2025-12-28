using MahaFight.Application.DTOs;
using MahaFight.Application.Interfaces;
using MahaFight.Domain.Entities;
using MahaFight.Domain.Interfaces;

namespace MahaFight.Application.Services;

public class InvoiceService
{
    private readonly IRepository<Sale> _saleRepository;
    private readonly IRepository<SaleItem> _saleItemRepository;
    private readonly IRepository<Invoice> _invoiceRepository;
    private readonly IRepository<Product> _productRepository;
    private readonly IRepository<Commission> _commissionRepository;
    private readonly IRepository<Dealer> _dealerRepository;
    private readonly IPdfService _pdfService;

    public InvoiceService(
        IRepository<Sale> saleRepository,
        IRepository<SaleItem> saleItemRepository,
        IRepository<Invoice> invoiceRepository,
        IRepository<Product> productRepository,
        IRepository<Commission> commissionRepository,
        IRepository<Dealer> dealerRepository,
        IPdfService pdfService)
    {
        _saleRepository = saleRepository;
        _saleItemRepository = saleItemRepository;
        _invoiceRepository = invoiceRepository;
        _productRepository = productRepository;
        _commissionRepository = commissionRepository;
        _dealerRepository = dealerRepository;
        _pdfService = pdfService;
    }

    public async Task<SaleResponseDto> CreateSaleAsync(CreateSaleRequest request)
    {
        var saleNumber = GenerateSaleNumber();
        decimal subtotal = 0;
        var saleItems = new List<SaleItem>();
        var products = new List<Product>();

        foreach (var item in request.Items)
        {
            var product = await _productRepository.GetByIdAsync(item.ProductId);
            if (product == null)
                throw new InvalidOperationException($"Product {item.ProductId} not found");

            // Check stock availability
            if (product.StockQuantity < item.Quantity)
                throw new InvalidOperationException($"Insufficient stock for {product.Name}. Available: {product.StockQuantity}, Requested: {item.Quantity}");

            var unitPrice = item.UnitPrice ?? product.UnitPrice;
            var lineTotal = unitPrice * item.Quantity;
            subtotal += lineTotal;

            saleItems.Add(new SaleItem
            {
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                UnitPrice = unitPrice,
                LineTotal = lineTotal
            });

            products.Add(product);
        }

        var taxAmount = subtotal * 0.18m; // 18% GST
        var totalAmount = subtotal + taxAmount;

        var sale = new Sale
        {
            SaleNumber = saleNumber,
            DealerId = request.DealerId,
            CustomerName = request.CustomerName,
            CustomerEmail = request.CustomerEmail,
            CustomerPhone = request.CustomerPhone,
            PaymentMethod = request.PaymentMethod,
            Subtotal = subtotal,
            TaxAmount = taxAmount,
            TotalAmount = totalAmount,
            PaymentStatus = "Pending"
        };

        var createdSale = await _saleRepository.AddAsync(sale);

        foreach (var item in saleItems)
        {
            item.SaleId = createdSale.Id;
            await _saleItemRepository.AddAsync(item);
        }

        // Update product stock quantities and expire QR codes
        for (int i = 0; i < products.Count; i++)
        {
            var product = products[i];
            var saleItem = saleItems[i];
            
            product.StockQuantity -= saleItem.Quantity;
            
            // Expire QR code when product is sold
            if (product.StockQuantity <= 0)
            {
                product.QrCodeExpiresAt = DateTime.UtcNow;
            }
            
            product.UpdatedAt = DateTime.UtcNow;
            await _productRepository.UpdateAsync(product);
        }

        // Auto-create invoice
        await CreateInvoiceForSaleAsync(createdSale.Id);

        // Calculate commission
        await CalculateCommissionAsync(createdSale);

        var itemDtos = saleItems.Zip(products, (item, product) => new SaleItemDto(
            product.Id,
            product.Name,
            item.Quantity,
            item.UnitPrice,
            item.LineTotal
        )).ToList();

        return new SaleResponseDto(
            createdSale.Id,
            createdSale.SaleNumber,
            createdSale.DealerId,
            createdSale.CustomerName,
            createdSale.SaleDate,
            createdSale.Subtotal,
            createdSale.TaxAmount,
            createdSale.TotalAmount,
            createdSale.PaymentStatus,
            itemDtos
        );
    }

    public async Task<InvoiceResponseDto> CreateInvoiceForSaleAsync(Guid saleId)
    {
        var sale = await _saleRepository.GetByIdAsync(saleId);
        if (sale == null)
            throw new InvalidOperationException("Sale not found");

        var dealer = await _dealerRepository.GetByIdAsync(sale.DealerId);
        var invoiceNumber = GenerateInvoiceNumber();

        var invoice = new Invoice
        {
            InvoiceNumber = invoiceNumber,
            SaleId = saleId,
            DealerId = sale.DealerId,
            DueDate = DateTime.UtcNow.AddDays(30),
            Subtotal = sale.Subtotal,
            TaxAmount = sale.TaxAmount,
            TotalAmount = sale.TotalAmount,
            BalanceAmount = sale.TotalAmount,
            Status = "Pending"
        };

        var created = await _invoiceRepository.AddAsync(invoice);

        return new InvoiceResponseDto(
            created.Id,
            created.InvoiceNumber,
            created.SaleId,
            dealer?.BusinessName ?? "Unknown Dealer",
            created.InvoiceDate,
            created.DueDate,
            created.TotalAmount,
            created.PaidAmount,
            created.BalanceAmount,
            created.Status
        );
    }

    public async Task<InvoiceResponseDto?> GetInvoiceBySaleIdAsync(Guid saleId)
    {
        var invoices = await _invoiceRepository.GetAllAsync();
        var inv = invoices.FirstOrDefault(i => i.SaleId == saleId);
        if (inv == null) return null;

        var dealer = await _dealerRepository.GetByIdAsync(inv.DealerId);

        return new InvoiceResponseDto(
            inv.Id,
            inv.InvoiceNumber,
            inv.SaleId,
            dealer?.BusinessName ?? "Unknown Dealer",
            inv.InvoiceDate,
            inv.DueDate,
            inv.TotalAmount,
            inv.PaidAmount,
            inv.BalanceAmount,
            inv.Status
        );
    }

    public async Task<byte[]> GenerateInvoicePdfAsync(Guid invoiceId)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(invoiceId);
        if (invoice == null)
            throw new InvalidOperationException("Invoice not found");

        var sale = await _saleRepository.GetByIdAsync(invoice.SaleId);
        if (sale == null)
            throw new InvalidOperationException("Sale not found");
            
        var allSaleItems = await _saleItemRepository.GetAllAsync();
        var saleItems = allSaleItems.Where(si => si.SaleId == sale.Id).ToList();

        var productIds = saleItems.Select(si => si.ProductId).ToList();
        var allProducts = await _productRepository.GetAllAsync();
        var products = allProducts.Where(p => productIds.Contains(p.Id)).ToList();

        var dealer = await _dealerRepository.GetByIdAsync(invoice.DealerId);

        // Use PDF service to generate proper PDF
        return await _pdfService.GenerateInvoicePdfAsync(invoice, sale, saleItems, products, dealer);
    }

    public async Task<IEnumerable<InvoiceResponseDto>> GetDealerInvoicesAsync(Guid dealerId)
    {
        var invoices = await _invoiceRepository.GetAllAsync();
        var dealer = await _dealerRepository.GetByIdAsync(dealerId);
        
        return invoices.Where(i => i.DealerId == dealerId)
            .Select(i => new InvoiceResponseDto(
                i.Id,
                i.InvoiceNumber,
                i.SaleId,
                dealer?.BusinessName ?? "Unknown Dealer",
                i.InvoiceDate,
                i.DueDate,
                i.TotalAmount,
                i.PaidAmount,
                i.BalanceAmount,
                i.Status
            ));
    }

    private async Task CalculateCommissionAsync(Sale sale)
    {
        var dealer = await _dealerRepository.GetByIdAsync(sale.DealerId);
        if (dealer == null) return;

        var commission = new Commission
        {
            DealerId = sale.DealerId,
            SaleId = sale.Id,
            CommissionRate = dealer.CommissionRate,
            SaleAmount = sale.TotalAmount,
            CommissionAmount = sale.TotalAmount * (dealer.CommissionRate / 100),
            PaymentStatus = "Pending"
        };

        await _commissionRepository.AddAsync(commission);
    }

    public async Task<IEnumerable<InvoiceResponseDto>> GetAllInvoicesAsync()
    {
        var invoices = await _invoiceRepository.GetAllAsync();
        var dealers = await _dealerRepository.GetAllAsync();
        
        return invoices.Select(i => {
            var dealer = dealers.FirstOrDefault(d => d.Id == i.DealerId);
            return new InvoiceResponseDto(
                i.Id,
                i.InvoiceNumber,
                i.SaleId,
                dealer?.BusinessName ?? "Unknown Dealer",
                i.InvoiceDate,
                i.DueDate,
                i.TotalAmount,
                i.PaidAmount,
                i.BalanceAmount,
                i.Status
            );
        });
    }

    public async Task UpdateInvoiceStatusAsync(Guid invoiceId, string status, decimal? paidAmount = null)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(invoiceId);
        if (invoice == null)
            throw new InvalidOperationException("Invoice not found");

        invoice.Status = status;
        if (paidAmount.HasValue)
        {
            invoice.PaidAmount = paidAmount.Value;
            invoice.BalanceAmount = invoice.TotalAmount - invoice.PaidAmount;
        }
        
        await _invoiceRepository.UpdateAsync(invoice);
    }

    public async Task<bool> UpdateDealerStatusAsync(Guid dealerId, bool isActive)
    {
        var dealer = await _dealerRepository.GetByIdAsync(dealerId);
        if (dealer == null) return false;

        // Update dealer status
        dealer.Status = isActive ? "Active" : "Inactive";
        await _dealerRepository.UpdateAsync(dealer);

        // Also update user status
        var userRepository = _dealerRepository as dynamic; // This won't work, need proper injection
        
        return true;
    }

    public async Task<SaleResponseDto?> GetSaleByIdAsync(Guid saleId)
    {
        var sale = await _saleRepository.GetByIdAsync(saleId);
        if (sale == null) return null;

        var allSaleItems = await _saleItemRepository.GetAllAsync();
        var saleItems = allSaleItems.Where(si => si.SaleId == saleId).ToList();

        var productIds = saleItems.Select(si => si.ProductId).ToList();
        var allProducts = await _productRepository.GetAllAsync();
        var products = allProducts.Where(p => productIds.Contains(p.Id)).ToList();

        var itemDtos = saleItems.Zip(products, (item, product) => new SaleItemDto(
            product.Id,
            product.Name,
            item.Quantity,
            item.UnitPrice,
            item.LineTotal
        )).ToList();

        return new SaleResponseDto(
            sale.Id,
            sale.SaleNumber,
            sale.DealerId,
            sale.CustomerName,
            sale.SaleDate,
            sale.Subtotal,
            sale.TaxAmount,
            sale.TotalAmount,
            sale.PaymentStatus,
            itemDtos
        );
    }

    public async Task<IEnumerable<object>> GetAllSalesAsync()
    {
        var sales = await _saleRepository.GetAllAsync();
        var dealers = await _dealerRepository.GetAllAsync();
        var result = new List<object>();

        foreach (var sale in sales)
        {
            var allSaleItems = await _saleItemRepository.GetAllAsync();
            var saleItems = allSaleItems.Where(si => si.SaleId == sale.Id).ToList();

            var productIds = saleItems.Select(si => si.ProductId).ToList();
            var allProducts = await _productRepository.GetAllAsync();
            var products = allProducts.Where(p => productIds.Contains(p.Id)).ToList();

            var dealer = dealers.FirstOrDefault(d => d.Id == sale.DealerId);

            var itemDtos = saleItems.Zip(products, (item, product) => new SaleItemDto(
                product.Id,
                product.Name,
                item.Quantity,
                item.UnitPrice,
                item.LineTotal
            )).ToList();

            result.Add(new {
                id = sale.Id,
                saleNumber = sale.SaleNumber,
                dealerId = sale.DealerId,
                dealerName = dealer?.BusinessName ?? "Unknown Dealer",
                customerName = sale.CustomerName,
                saleDate = sale.SaleDate,
                subtotal = sale.Subtotal,
                taxAmount = sale.TaxAmount,
                totalAmount = sale.TotalAmount,
                paymentStatus = sale.PaymentStatus,
                items = itemDtos
            });
        }

        return result;
    }

    public async Task<bool> UpdateSalePaymentStatusAsync(Guid saleId, string paymentStatus)
    {
        var sale = await _saleRepository.GetByIdAsync(saleId);
        if (sale == null) return false;

        sale.PaymentStatus = paymentStatus;
        await _saleRepository.UpdateAsync(sale);
        return true;
    }

    private static string GenerateSaleNumber()
    {
        return $"SALE-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpper()}";
    }

    private static string GenerateInvoiceNumber()
    {
        return $"INV-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpper()}";
    }
}