using Microsoft.AspNetCore.Http;
using FluentValidation;

namespace MahaFight.Application.DTOs;

public record DealerRegistrationRequest(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string Phone,
    string BusinessName,
    string BusinessType,
    string RegistrationNumber,
    string TaxId,
    string Address,
    string City,
    string State,
    string PostalCode,
    bool? IsActive = null,
    string Country = "India"
);

public record KycDocumentUploadRequest(
    Guid DealerId,
    string DocumentType,
    string DocumentNumber,
    IFormFile DocumentFile
);

public record DealerApprovalRequest(
    Guid DealerId,
    string Status,
    string? Notes
);

public record DealerRegistrationResponse(
    Guid Id,
    string Email,
    string BusinessName,
    string Status,
    DateTime CreatedAt
);

public record KycDocumentDto(
    Guid Id,
    string DocumentType,
    string DocumentNumber,
    string? DocumentUrl,
    string VerificationStatus,
    DateTime? VerifiedAt,
    string? Notes
);

public class DealerRegistrationValidator : AbstractValidator<DealerRegistrationRequest>
{
    public DealerRegistrationValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(100);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6).MaximumLength(50);
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(50);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Phone).NotEmpty().MaximumLength(20);
        RuleFor(x => x.BusinessName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.BusinessType).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Address).NotEmpty().MaximumLength(500);
        RuleFor(x => x.City).NotEmpty().MaximumLength(50);
        RuleFor(x => x.State).NotEmpty().MaximumLength(50);
        RuleFor(x => x.PostalCode).NotEmpty().MaximumLength(20);
    }
}

public class KycDocumentUploadValidator : AbstractValidator<KycDocumentUploadRequest>
{
    public KycDocumentUploadValidator()
    {
        RuleFor(x => x.DealerId).NotEmpty();
        RuleFor(x => x.DocumentType).NotEmpty().Must(x => new[] { "PAN", "Aadhaar", "Photo" }.Contains(x));
        RuleFor(x => x.DocumentNumber).NotEmpty().MaximumLength(100);
        RuleFor(x => x.DocumentFile).NotNull().Must(x => x.Length > 0 && x.Length < 5 * 1024 * 1024);
    }
}