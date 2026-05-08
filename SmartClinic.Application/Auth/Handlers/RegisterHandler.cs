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

        var role = await _userRepo.GetRoleByNameAsync("Receptionist");
        if (role is null)
        {
            throw new AppValidationException(new Dictionary<string, string[]>
            {
                ["Role"] = ["Receptionist role does not exist."]
            });
        }

        if (!await _userRepo.ClinicExistsAsync(command.ClinicId))
        {
            throw new AppValidationException(new Dictionary<string, string[]>
            {
                [nameof(command.ClinicId)] = ["Clinic does not exist."]
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
            ClinicId = command.ClinicId,
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
}
