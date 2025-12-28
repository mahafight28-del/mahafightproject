using System.Text.Json.Serialization;
using FluentValidation;
using MahaFight.Domain.Entities;

namespace MahaFight.Application.DTOs;

public record SendOtpRequest(string Email, OtpPurpose Purpose);

public record VerifyOtpRequest(string Email, string Otp, OtpPurpose Purpose);

public record LoginWithOtpRequest(string Email, string Otp);

public record ResetPasswordWithOtpRequest(string Email, string Otp, string NewPassword);

public record OtpResponse(bool Success, string Message, string? Token = null);

// Validators
public class SendOtpValidator : AbstractValidator<SendOtpRequest>
{
    public SendOtpValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(100);
        
        RuleFor(x => x.Purpose)
            .IsInEnum();
    }
}

public class VerifyOtpValidator : AbstractValidator<VerifyOtpRequest>
{
    public VerifyOtpValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress();
            
        RuleFor(x => x.Otp)
            .NotEmpty()
            .Length(6)
            .Must(x => x.All(char.IsDigit))
            .WithMessage("OTP must be 6 digits");
            
        RuleFor(x => x.Purpose)
            .IsInEnum();
    }
}

public class ResetPasswordWithOtpValidator : AbstractValidator<ResetPasswordWithOtpRequest>
{
    public ResetPasswordWithOtpValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress();
            
        RuleFor(x => x.Otp)
            .NotEmpty()
            .Length(6)
            .Must(x => x.All(char.IsDigit));
            
        RuleFor(x => x.NewPassword)
            .NotEmpty()
            .MinimumLength(6)
            .MaximumLength(50);
    }
}