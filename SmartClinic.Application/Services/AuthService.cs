using Microsoft.Extensions.Logging;
using SmartClinic.Application.Common.Exceptions;
using SmartClinic.Application.DTOs.Auth;
using SmartClinic.Application.Interfaces;
using SmartClinic.Domain.Entities;

namespace SmartClinic.Application.Services;

public class AuthService : IAuthService
{
    private const string PublicRegistrationRole = "Receptionist";

    private readonly IUserRepository _userRepo;
    private readonly IJwtService _jwtService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUserRepository userRepo,
        IJwtService jwtService,
        ILogger<AuthService> logger)
    {
        _userRepo = userRepo;
        _jwtService = jwtService;
        _logger = logger;
    }

    public async Task<AuthResult> Register(RegisterRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        if (await _userRepo.ExistsByEmailAsync(email))
            throw new ConflictException("Email already registered.");

        var role = await _userRepo.GetRoleByNameAsync(PublicRegistrationRole);
        if (role is null)
            throw new AppValidationException(new Dictionary<string, string[]>
            {
                ["Role"] = [$"{PublicRegistrationRole} role does not exist."]
            });

        var clinicId = await _userRepo.GetDefaultClinicIdAsync();
        if (clinicId is null || !await _userRepo.ClinicExistsAsync(clinicId.Value))
            throw new AppValidationException(new Dictionary<string, string[]>
            {
                ["Clinic"] = ["No clinic is ready yet. Please contact an administrator."]
            });

        var user = new User
        {
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Phone = request.Phone.Trim(),
            RoleId = role.Id,
            ClinicId = clinicId.Value,
            Status = "Active"
        };

        await _userRepo.AddAsync(user);
        await _userRepo.SaveChangesAsync();

        _logger.LogInformation(
            "User {UserId} registered with public role {Role} in clinic {ClinicId}.",
            user.Id,
            role.Name,
            user.ClinicId);

        var token = _jwtService.GenerateToken(user, role.Name);

        return new AuthResult(token, user.Email, $"{user.FirstName} {user.LastName}", role.Name);
    }

    public async Task<AuthResult> Login(LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _userRepo.GetByEmailAsync(email);
        if (user is null)
        {
            _logger.LogWarning("Login failed for {Email}: user not found.", email);
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        var isValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
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
