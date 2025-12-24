using FluentValidation;

namespace MahaFight.Application.DTOs;

public record SendOtpRequest(string Identifier); // Email or Phone

public record VerifyOtpRequest(string Identifier, string Otp);

public record ResetPasswordRequest(string Identifier, string Otp, string NewPassword);

public record ForgotPasswordResponse(bool Success, string Message, int? ResendAfterSeconds = null);

// Validators
public class SendOtpValidator : AbstractValidator<SendOtpRequest>
{
    public SendOtpValidator()
    {
        RuleFor(x => x.Identifier)
            .NotEmpty()
            .Must(BeValidEmailOrPhone)
            .WithMessage("Please enter a valid email or phone number");
    }

    private bool BeValidEmailOrPhone(string identifier)
    {
        return IsValidEmail(identifier) || IsValidPhone(identifier);
    }

    private bool IsValidEmail(string email) => 
        !string.IsNullOrEmpty(email) && email.Contains("@") && email.Length <= 100;

    private bool IsValidPhone(string phone) => 
        !string.IsNullOrEmpty(phone) && phone.All(char.IsDigit) && phone.Length == 10;
}

public class ResetPasswordValidator : AbstractValidator<ResetPasswordRequest>
{
    public ResetPasswordValidator()
    {
        RuleFor(x => x.Identifier).NotEmpty();
        RuleFor(x => x.Otp).NotEmpty().Length(6).Must(x => x.All(char.IsDigit));
        RuleFor(x => x.NewPassword).NotEmpty().MinimumLength(6).MaximumLength(50);
    }
}