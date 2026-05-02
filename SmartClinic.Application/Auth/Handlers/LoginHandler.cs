using SmartClinic.Application.Auth.Commands;
using SmartClinic.Application.Auth.DTOs;
using SmartClinic.Application.Interfaces;

namespace SmartClinic.Application.Auth.Handlers;

public class LoginHandler
{
    private readonly IUserRepository _userRepo;
    private readonly IJwtService _jwtService;

    public LoginHandler(IUserRepository userRepo, IJwtService jwtService)
    {
        _userRepo = userRepo;
        _jwtService = jwtService;
    }

    public async Task<AuthResult> Handle(LoginCommand command)
    {
        var user = await _userRepo.GetByEmailAsync(command.Email);
        if (user is null)
            throw new Exception("Invalid email or password.");

        var isValid = BCrypt.Net.BCrypt.Verify(command.Password, user.PasswordHash);
        if (!isValid)
            throw new Exception("Invalid email or password.");

        var role = await _userRepo.GetRoleNameAsync(user.RoleId);
        var token = _jwtService.GenerateToken(user, role);

        return new AuthResult(token, user.Email, $"{user.FirstName} {user.LastName}", role);
    }
}