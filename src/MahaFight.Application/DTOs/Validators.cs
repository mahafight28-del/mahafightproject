using FluentValidation;

namespace MahaFight.Application.DTOs;

public class CreateSaleItemValidator : AbstractValidator<SaleItemRequest>
{
    public CreateSaleItemValidator()
    {
        RuleFor(x => x.ProductId).NotEmpty();
        RuleFor(x => x.Quantity).GreaterThan(0);
        RuleFor(x => x.UnitPrice).GreaterThan(0).When(x => x.UnitPrice.HasValue);
    }
}