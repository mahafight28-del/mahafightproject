using Microsoft.EntityFrameworkCore;
using MahaFight.Application.DTOs;
using MahaFight.Application.Interfaces;
using MahaFight.Domain.Entities;
using MahaFight.Domain.Interfaces;

namespace MahaFight.Application.Services;

public class DealerService
{
    private readonly IRepository<Dealer> _dealerRepository;
    private readonly IRepository<User> _userRepository;
    private readonly IRepository<DealerKyc> _kycRepository;
    private readonly IAuthService _authService;
    private readonly IFileUploadService _fileUploadService;

    public DealerService(
        IRepository<Dealer> dealerRepository,
        IRepository<User> userRepository,
        IRepository<DealerKyc> kycRepository,
        IAuthService authService,
        IFileUploadService fileUploadService)
    {
        _dealerRepository = dealerRepository;
        _userRepository = userRepository;
        _kycRepository = kycRepository;
        _authService = authService;
        _fileUploadService = fileUploadService;
    }

    public async Task<IEnumerable<DealerDto>> GetAllAsync()
    {
        var dealers = await _dealerRepository.GetAllAsync();
        var users = await _userRepository.GetAllAsync();
        var kycDocs = await _kycRepository.GetAllAsync();
        
        return dealers.Select(d => {
            var user = users.FirstOrDefault(u => u.Id == d.UserId);
            var kycStatus = GetKycStatus(kycDocs, d.Id);
            
            return new DealerDto(
                d.Id,
                d.UserId,
                d.BusinessName, 
                user?.Email ?? "", 
                user?.Phone ?? "", 
                d.Address,
                d.BusinessType ?? "",
                d.Status == "Active" && kycStatus == "Approved",
                kycStatus,
                d.CreatedAt,
                d.UpdatedAt ?? d.CreatedAt
            );
        });
    }

    private static string GetKycStatus(IEnumerable<DealerKyc> kycDocs, Guid dealerId)
    {
        var dealerKyc = kycDocs.Where(k => k.DealerId == dealerId).ToList();
        
        Console.WriteLine($"GetKycStatus for dealer {dealerId}: Found {dealerKyc.Count} documents");
        
        if (!dealerKyc.Any()) 
        {
            Console.WriteLine("No KYC documents found - returning Not Submitted");
            return "Not Submitted";
        }
        
        foreach (var doc in dealerKyc)
        {
            Console.WriteLine($"KYC Doc {doc.Id}: Type={doc.DocumentType}, Status={doc.VerificationStatus}");
        }
        
        if (dealerKyc.Any(k => k.VerificationStatus == KycStatus.APPROVED)) 
        {
            Console.WriteLine("Found APPROVED document - returning Approved");
            return "Approved";
        }
        if (dealerKyc.Any(k => k.VerificationStatus == KycStatus.REJECTED)) 
        {
            Console.WriteLine("Found REJECTED document - returning Rejected");
            return "Rejected";
        }
        if (dealerKyc.Any(k => k.VerificationStatus == KycStatus.PENDING)) 
        {
            Console.WriteLine("Found PENDING document - returning Pending");
            return "Pending";
        }
        
        Console.WriteLine("No status match - returning Not Submitted");
        return "Not Submitted";
    }

    public async Task<DealerDto?> GetByIdAsync(Guid id)
    {
        var dealer = await _dealerRepository.GetByIdAsync(id);
        if (dealer == null) return null;
        
        var user = await _userRepository.GetByIdAsync(dealer.UserId);
        var kycDocs = await _kycRepository.GetAllAsync();
        var kycStatus = GetKycStatus(kycDocs, dealer.Id);
        
        return new DealerDto(
            dealer.Id,
            dealer.UserId,
            dealer.BusinessName, 
            user?.Email ?? "", 
            user?.Phone ?? "", 
            dealer.Address,
            dealer.BusinessType ?? "",
            dealer.Status == "Active",
            kycStatus,
            dealer.CreatedAt,
            dealer.UpdatedAt ?? dealer.CreatedAt
        );
    }

    public async Task<DealerDto?> UpdateDealerAsync(Guid id, DealerRegistrationRequest request)
    {
        // Update dealer information
        var dealer = await _dealerRepository.GetByIdAsync(id);
        if (dealer == null) return null;

        var user = await _userRepository.GetByIdAsync(dealer.UserId);
        if (user == null) return null;

        // Update user info and sync with dealer
        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Email = request.Email;
        user.Phone = request.Phone;
        await _userRepository.UpdateAsync(user);

        // Update dealer info
        dealer.BusinessName = request.BusinessName;
        dealer.BusinessType = request.BusinessType;
        dealer.RegistrationNumber = request.RegistrationNumber;
        dealer.TaxId = request.TaxId;
        dealer.Address = request.Address;
        dealer.City = request.City;
        dealer.State = request.State;
        dealer.PostalCode = request.PostalCode;
        dealer.Country = request.Country;
        dealer.UpdatedAt = DateTime.UtcNow;
        
        // Handle isActive field from frontend
        if (request.IsActive.HasValue)
        {
            dealer.Status = request.IsActive.Value ? "Active" : "Inactive";
            user.IsActive = request.IsActive.Value;
        }
        
        await _dealerRepository.UpdateAsync(dealer);
        
        return await GetByIdAsync(id);
    }

    public async Task<DealerRegistrationResponse> RegisterDealerAsync(DealerRegistrationRequest request)
    {
        // Create user account
        var userCreated = await _authService.RegisterUserAsync(
            request.Email, request.Password, request.FirstName, request.LastName, "Dealer");
        
        if (!userCreated)
            throw new InvalidOperationException("User already exists");

        var user = await _userRepository.GetAllAsync();
        var newUser = user.First(u => u.Email == request.Email);

        // Create dealer profile
        var dealer = new Dealer
        {
            UserId = newUser.Id,
            BusinessName = request.BusinessName,
            BusinessType = request.BusinessType,
            RegistrationNumber = request.RegistrationNumber,
            TaxId = request.TaxId,
            Address = request.Address,
            City = request.City,
            State = request.State,
            PostalCode = request.PostalCode,
            Country = request.Country,
            Status = "Pending"
        };

        var createdDealer = await _dealerRepository.AddAsync(dealer);
        
        return new DealerRegistrationResponse(
            createdDealer.Id,
            request.Email,
            request.BusinessName,
            "Pending",
            createdDealer.CreatedAt
        );
    }

    public async Task<KycDocumentDto> UploadKycDocumentAsync(KycDocumentUploadRequest request)
    {
        // First, find the dealer record for this user ID
        var dealers = await _dealerRepository.GetAllAsync();
        var dealer = dealers.FirstOrDefault(d => d.UserId == request.DealerId);
        
        if (dealer == null)
        {
            throw new InvalidOperationException("Dealer record not found for this user");
        }

        var fileName = $"{dealer.Id}_{request.DocumentType}_{DateTime.UtcNow:yyyyMMdd}";
        var filePath = await _fileUploadService.UploadFileAsync(request.DocumentFile, "kyc", fileName);

        var kycDocument = new DealerKyc
        {
            DealerId = dealer.Id, // Use actual dealer ID, not user ID
            DocumentType = request.DocumentType,
            DocumentNumber = request.DocumentNumber,
            DocumentUrl = filePath,
            VerificationStatus = KycStatus.PENDING
        };

        var created = await _kycRepository.AddAsync(kycDocument);
        
        return new KycDocumentDto(
            created.Id,
            created.DocumentType,
            created.DocumentNumber,
            created.DocumentUrl,
            created.VerificationStatus.ToString(),
            created.VerifiedAt,
            created.Notes
        );
    }

    public async Task<bool> ApproveDealerAsync(DealerApprovalRequest request, Guid approvedBy)
    {
        Console.WriteLine($"ApproveDealerAsync called: DealerId={request.DealerId}, Status={request.Status}");
        
        var dealer = await _dealerRepository.GetByIdAsync(request.DealerId);
        if (dealer == null) 
        {
            Console.WriteLine($"Dealer not found: {request.DealerId}");
            return false;
        }

        // Update KYC documents first
        var kycDocs = await _kycRepository.GetAllAsync();
        var dealerKyc = kycDocs.Where(k => k.DealerId == request.DealerId).ToList();
        
        Console.WriteLine($"Found {dealerKyc.Count} KYC documents for dealer {request.DealerId}");
        
        if (request.Status == "Approved")
        {
            foreach (var doc in dealerKyc)
            {
                doc.VerificationStatus = KycStatus.APPROVED;
                doc.VerifiedBy = approvedBy;
                doc.VerifiedAt = DateTime.UtcNow;
                doc.Notes = request.Notes;
                await _kycRepository.UpdateAsync(doc);
                Console.WriteLine($"Updated KYC doc {doc.Id} to APPROVED");
            }
            
            // Only set dealer as Active if KYC is approved
            dealer.Status = "Active";
            Console.WriteLine($"Set dealer status to Active");
        }
        else if (request.Status == "Rejected")
        {
            foreach (var doc in dealerKyc)
            {
                doc.VerificationStatus = KycStatus.REJECTED;
                doc.VerifiedBy = approvedBy;
                doc.VerifiedAt = DateTime.UtcNow;
                doc.Notes = request.Notes;
                await _kycRepository.UpdateAsync(doc);
                Console.WriteLine($"Updated KYC doc {doc.Id} to REJECTED");
            }
            
            // Block dealer if KYC is rejected
            dealer.Status = "Blocked";
            Console.WriteLine($"Set dealer status to Blocked");
        }

        dealer.UpdatedAt = DateTime.UtcNow;
        await _dealerRepository.UpdateAsync(dealer);
        Console.WriteLine($"Updated dealer {dealer.Id} in database");
        return true;
    }

    public async Task<IEnumerable<KycDocumentDto>> GetDealerKycDocumentsAsync(Guid userId)
    {
        // First, find the dealer record for this user ID
        var dealers = await _dealerRepository.GetAllAsync();
        var dealer = dealers.FirstOrDefault(d => d.UserId == userId);
        
        if (dealer == null)
        {
            return new List<KycDocumentDto>();
        }

        var docs = await _kycRepository.GetAllAsync();
        return docs.Where(d => d.DealerId == dealer.Id) // Use actual dealer ID
                  .Select(d => new KycDocumentDto(d.Id, d.DocumentType, d.DocumentNumber, d.DocumentUrl, d.VerificationStatus.ToString(), d.VerifiedAt, d.Notes));
    }

    public async Task<IEnumerable<KycDocumentDto>> GetKycDocumentsByDealerIdAsync(Guid dealerId)
    {
        // For admin - direct dealer ID lookup
        var docs = await _kycRepository.GetAllAsync();
        return docs.Where(d => d.DealerId == dealerId)
                  .Select(d => new KycDocumentDto(d.Id, d.DocumentType, d.DocumentNumber, d.DocumentUrl, d.VerificationStatus.ToString(), d.VerifiedAt, d.Notes));
    }
}