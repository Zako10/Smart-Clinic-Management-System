using System.Security.Claims;
using SmartClinic.Application.Interfaces;

namespace SmartClinic.API.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

    public int? UserId => TryGetInt(ClaimTypes.NameIdentifier);

    public int? ClinicId => TryGetInt("ClinicId");

    public string? Role => User?.FindFirst(ClaimTypes.Role)?.Value;

    public bool IsAuthenticated => User?.Identity?.IsAuthenticated == true;

    public bool IsAdmin => User?.IsInRole("Admin") == true;

    public bool IsDoctor => User?.IsInRole("Doctor") == true;

    public bool IsReceptionist => User?.IsInRole("Receptionist") == true;

    private int? TryGetInt(string claimType)
    {
        var value = User?.FindFirst(claimType)?.Value;
        return int.TryParse(value, out var id) ? id : null;
    }
}
