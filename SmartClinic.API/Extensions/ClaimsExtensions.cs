using System.Security.Claims;

namespace SmartClinic.API.Extensions;

public static class ClaimsExtensions
{
    public static int GetClinicId(this ClaimsPrincipal user)
    {
        var clinicClaim = user.FindFirst("ClinicId")?.Value;
        return int.TryParse(clinicClaim, out var id) ? id : 0;
    }

    public static string? GetRole(this ClaimsPrincipal user)
    {
        return user.FindFirst(ClaimTypes.Role)?.Value;
    }

    public static int GetUserId(this ClaimsPrincipal user)
    {
        var idClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(idClaim, out var id) ? id : 0;
    }

    public static bool IsAdmin(this ClaimsPrincipal user)
        => user.IsInRole("Admin");

    public static bool IsDoctor(this ClaimsPrincipal user)
        => user.IsInRole("Doctor");

    public static bool IsReceptionist(this ClaimsPrincipal user)
        => user.IsInRole("Receptionist");
}