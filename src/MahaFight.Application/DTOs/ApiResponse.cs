namespace MahaFight.Application.DTOs;

public record ApiResponse<T>(bool Success, T? Data, string? Message = null, object? Errors = null)
{
    public static ApiResponse<T> SuccessResult(T data, string? message = null) => new(true, data, message);
    public static ApiResponse<T> ErrorResult(string message, object? errors = null) => new(false, default, message, errors);
}