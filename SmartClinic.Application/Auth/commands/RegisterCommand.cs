namespace SmartClinic.Application.Auth.Commands;

public record RegisterCommand(
    string FirstName,
    string LastName,
    string Email,
    string Password,
    string Phone,
    int RoleId,
    int ClinicId
);