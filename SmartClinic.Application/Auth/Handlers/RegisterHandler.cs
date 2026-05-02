using SmartClinic.Application.Auth.Commands;
using SmartClinic.Application.DTOs.Auth;
using SmartClinic.Application.Interfaces;
using SmartClinic.Domain.Entities;

namespace SmartClinic.Application.Auth.Handlers;

public class RegisterHandler
{
    private readonly IUserRepository _userRepo;
    private readonly IJwtService _jwtService;

    public RegisterHandler(IUserRepository userRepo, IJwtService jwtService)
    {
        _userRepo = userRepo;
        _jwtService = jwtService;
    }

    public async Task<AuthResult> Handle(RegisterCommand command)
    {
        if (string.IsNullOrWhiteSpace(command.Email) ||
            string.IsNullOrWhiteSpace(command.Password) ||
            string.IsNullOrWhiteSpace(command.FirstName) ||
            string.IsNullOrWhiteSpace(command.LastName))
        {
            throw new ArgumentException("First name, last name, email, and password are required.");
        }

        if (command.Password.Length < 8)
        {
            throw new ArgumentException("Password must be at least 8 characters.");
        }

        var email = command.Email.Trim().ToLowerInvariant();

        if (await _userRepo.ExistsByEmailAsync(email))
        {
            throw new InvalidOperationException("Email already registered.");
        }

        var role = await _userRepo.GetRoleNameAsync(command.RoleId);
        if (role is null)
        {
            throw new ArgumentException("Invalid role.");
        }

        if (!await _userRepo.ClinicExistsAsync(command.ClinicId))
        {
            throw new ArgumentException("Invalid clinic.");
        }

        var user = new User
        {
            FirstName = command.FirstName.Trim(),
            LastName = command.LastName.Trim(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(command.Password),
            Phone = command.Phone.Trim(),
            RoleId = command.RoleId,
            ClinicId = command.ClinicId,
            Status = "Active"
        };

        await _userRepo.AddAsync(user);
        await _userRepo.SaveChangesAsync();

        var token = _jwtService.GenerateToken(user, role);

        return new AuthResult(token, user.Email, $"{user.FirstName} {user.LastName}", role);
    }
}
