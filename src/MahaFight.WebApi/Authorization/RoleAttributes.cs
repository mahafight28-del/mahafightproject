using Microsoft.AspNetCore.Authorization;

namespace MahaFight.WebApi.Authorization;

public class AdminOnlyAttribute : AuthorizeAttribute
{
    public AdminOnlyAttribute() : base()
    {
        Roles = "Admin";
    }
}

public class DealerOrAdminAttribute : AuthorizeAttribute
{
    public DealerOrAdminAttribute() : base()
    {
        Roles = "Admin,Dealer";
    }
}