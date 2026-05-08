using Microsoft.Extensions.Logging;
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
    private readonly ILogger<LoginHandler> _logger;

    public LoginHandler(
        IUserRepository userRepo,
        IJwtService jwtService,
        ICommandValidator<LoginCommand> validator,
        ILogger<LoginHandler> logger)
    {
        _userRepo = userRepo;
        _jwtService = jwtService;
        _validator = validator;
        _logger = logger;
    }

    public async Task<AuthResult> Handle(LoginCommand command)
    {
        _validator.Validate(command);

        var email = command.Email.Trim().ToLowerInvariant();
        var user = await _userRepo.GetByEmailAsync(email);
        if (user is null)
        {
            _logger.LogWarning("Login failed for {Email}: user not found.", email);
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        var isValid = BCrypt.Net.BCrypt.Verify(command.Password, user.PasswordHash);
        if (!isValid)
        {
            _logger.LogWarning("Login failed for user {UserId}: invalid password.", user.Id);
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        if (!string.Equals(user.Status, "Active", StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogWarning("Login failed for user {UserId}: inactive account.", user.Id);
            throw new UnauthorizedAccessException("User account is not active.");
        }

        var role = await _userRepo.GetRoleNameAsync(user.RoleId);
        if (role is null)
        {
            _logger.LogWarning("Login failed for user {UserId}: invalid role {RoleId}.", user.Id, user.RoleId);
            throw new UnauthorizedAccessException("User role is invalid.");
        }

        var token = _jwtService.GenerateToken(user, role);

        _logger.LogInformation(
            "User {UserId} logged in with role {Role} in clinic {ClinicId}.",
            user.Id,
            role,
            user.ClinicId);

        return new AuthResult(token, user.Email, $"{user.FirstName} {user.LastName}", role);
    }
}
