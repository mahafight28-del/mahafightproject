using FluentValidation;

namespace MahaFight.Application.DTOs;

public record ResetPasswordRequest(string Identifier, string Otp, string NewPassword);

public record ForgotPasswordResponse(bool Success, string Message, int? ResendAfterSeconds = null);

public class ResetPasswordValidator : AbstractValidator<ResetPasswordRequest>
{
    public ResetPasswordValidator()
    {
        RuleFor(x => x.Identifier).NotEmpty();
        RuleFor(x => x.Otp).NotEmpty().Length(6).Must(x => x.All(char.IsDigit));
        RuleFor(x => x.NewPassword).NotEmpty().MinimumLength(6).MaximumLength(50);
    }
}