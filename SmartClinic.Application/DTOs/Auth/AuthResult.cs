namespace SmartClinic.Application.Auth.DTOs;

public record AuthResult(
    string Token,
    string Email,
    string FullName,
    string Role
);