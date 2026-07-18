using SmartClinic.Application.DTOs.Auth;

namespace SmartClinic.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResult> Register(RegisterRequest request);
    Task<AuthResult> Login(LoginRequest request);
}
