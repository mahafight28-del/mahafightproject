using FluentValidation;

namespace MahaFight.Application.DTOs;

public record CreateDealerRequest(string Name, string Email, string Phone, string Address);

public class CreateDealerValidator : AbstractValidator<CreateDealerRequest>
{
    public CreateDealerValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(100);
        RuleFor(x => x.Phone).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Address).NotEmpty().MaximumLength(200);
    }
}