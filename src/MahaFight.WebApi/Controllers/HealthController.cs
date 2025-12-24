using Microsoft.AspNetCore.Mvc;

namespace MahaFight.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public ActionResult<object> Get()
    {
        return Ok(new { status = "Healthy", timestamp = DateTime.UtcNow });
    }
}