namespace MahaFight.Application.DTOs;

public record DealerDto(
    Guid Id,
    Guid UserId,
    string Name,
    string Email,
    string Phone,
    string Address,
    string BusinessType,
    bool IsActive,
    string KycStatus,
    DateTime CreatedAt,
    DateTime UpdatedAt
);