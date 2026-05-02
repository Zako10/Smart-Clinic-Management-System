namespace SmartClinic.Application.DTOs.Auth;

public record AuthResult(
    string Token,
    string Email,
    string FullName,
    string Role
);
