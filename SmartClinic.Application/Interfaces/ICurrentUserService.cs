namespace SmartClinic.Application.Interfaces;

public interface ICurrentUserService
{
    int? UserId { get; }
    int? ClinicId { get; }
    string? Role { get; }
    bool IsAuthenticated { get; }
    bool IsAdmin { get; }
    bool IsDoctor { get; }
    bool IsReceptionist { get; }
}
