using Microsoft.AspNetCore.Mvc;

namespace AlManan.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    protected ActionResult HandleError(string message, int statusCode = 400)
    {
        return StatusCode(statusCode, new { message });
    }
}
