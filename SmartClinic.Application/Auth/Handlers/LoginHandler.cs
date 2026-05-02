using SmartClinic.Application.Auth.Commands;
using SmartClinic.Application.Common.Validation;
using SmartClinic.Application.DTOs.Auth;
using SmartClinic.Application.Interfaces;

namespace SmartClinic.Application.Auth.Handlers;

public class LoginHandler
{
    private readonly IUserRepository _userRepo;
    private readonly IJwtService _jwtService;
    private readonly ICommandValidator<LoginCommand> _validator;

    public LoginHandler(
        IUserRepository userRepo,
        IJwtService jwtService,
        ICommandValidator<LoginCommand> validator)
    {
        _userRepo = userRepo;
        _jwtService = jwtService;
        _validator = validator;
    }

    public async Task<AuthResult> Handle(LoginCommand command)
    {
        _validator.Validate(command);

        var email = command.Email.Trim().ToLowerInvariant();
        var user = await _userRepo.GetByEmailAsync(email);
        if (user is null)
            throw new UnauthorizedAccessException("Invalid email or password.");

        var isValid = BCrypt.Net.BCrypt.Verify(command.Password, user.PasswordHash);
        if (!isValid)
            throw new UnauthorizedAccessException("Invalid email or password.");

        if (!string.Equals(user.Status, "Active", StringComparison.OrdinalIgnoreCase))
            throw new UnauthorizedAccessException("User account is not active.");

        var role = await _userRepo.GetRoleNameAsync(user.RoleId);
        if (role is null)
            throw new UnauthorizedAccessException("User role is invalid.");

        var token = _jwtService.GenerateToken(user, role);

        return new AuthResult(token, user.Email, $"{user.FirstName} {user.LastName}", role);
    }
}
