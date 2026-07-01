using Microsoft.Extensions.Logging;
using SmartClinic.Application.Auth.Commands;
using SmartClinic.Application.Common.Exceptions;
using SmartClinic.Application.Common.Validation;
using SmartClinic.Application.DTOs.Auth;
using SmartClinic.Application.Interfaces;
using SmartClinic.Domain.Entities;

namespace SmartClinic.Application.Auth.Handlers;

public class RegisterHandler
{
    private readonly IUserRepository _userRepo;
    private readonly IJwtService _jwtService;
    private readonly ICommandValidator<RegisterCommand> _validator;
    private readonly ILogger<RegisterHandler> _logger;

    public RegisterHandler(
        IUserRepository userRepo,
        IJwtService jwtService,
        ICommandValidator<RegisterCommand> validator,
        ILogger<RegisterHandler> logger)
    {
        _userRepo = userRepo;
        _jwtService = jwtService;
        _validator = validator;
        _logger = logger;
    }

    public async Task<AuthResult> Handle(RegisterCommand command)
    {
        _validator.Validate(command);

        var email = command.Email.Trim().ToLowerInvariant();

        if (await _userRepo.ExistsByEmailAsync(email))
        {
            throw new ConflictException("Email already registered.");
        }

        var selectedRole = NormalizeRole(command.Role);
        var role = await _userRepo.GetRoleByNameAsync(selectedRole);
        if (role is null)
        {
            throw new AppValidationException(new Dictionary<string, string[]>
            {
                ["Role"] = [$"{selectedRole} role does not exist."]
            });
        }

        var clinicId = command.ClinicId > 0
            ? command.ClinicId
            : await _userRepo.GetDefaultClinicIdAsync();

        if (clinicId is null || !await _userRepo.ClinicExistsAsync(clinicId.Value))
        {
            throw new AppValidationException(new Dictionary<string, string[]>
            {
                ["Clinic"] = ["No clinic is ready yet. Please restart the server and try again."]
            });
        }

        var user = new User
        {
            FirstName = command.FirstName.Trim(),
            LastName = command.LastName.Trim(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(command.Password),
            Phone = command.Phone.Trim(),
            RoleId = role.Id,
            ClinicId = clinicId.Value,
            Status = "Active"
        };

        await _userRepo.AddAsync(user);
        await _userRepo.SaveChangesAsync();

        _logger.LogInformation(
            "User {UserId} registered with role {Role} in clinic {ClinicId}.",
            user.Id,
            role.Name,
            user.ClinicId);

        var token = _jwtService.GenerateToken(user, role.Name);

        return new AuthResult(token, user.Email, $"{user.FirstName} {user.LastName}", role.Name);
    }

    private static string NormalizeRole(string role)
    {
        return role.Trim().ToLowerInvariant() switch
        {
            "admin" => "Admin",
            "doctor" => "Doctor",
            _ => "Receptionist"
        };
    }
}
