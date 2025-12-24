namespace MahaFight.Application.DTOs;

public record CreateFranchiseRequest(
    string FranchiseName,
    string FranchiseCode,
    Guid OwnerId,
    string Territory,
    string Address,
    string City,
    string State,
    string PostalCode,
    decimal FranchiseFee,
    decimal RoyaltyRate,
    DateTime ContractStartDate,
    DateTime ContractEndDate,
    string Country = "India"
);

public record FranchiseDto(
    Guid Id,
    string FranchiseName,
    string FranchiseCode,
    Guid OwnerId,
    string OwnerName,
    string Territory,
    string Address,
    string City,
    string State,
    string PostalCode,
    string Country,
    decimal FranchiseFee,
    decimal RoyaltyRate,
    DateTime ContractStartDate,
    DateTime ContractEndDate,
    string Status,
    DateTime CreatedAt
);