namespace MahaFight.Application.DTOs;

public record ProductImageDto(
    Guid Id,
    string FileName,
    string Url,
    bool IsDefault,
    int DisplayOrder
);

public record UploadProductImageRequest(
    Guid ProductId,
    bool IsDefault = false,
    int DisplayOrder = 0
);