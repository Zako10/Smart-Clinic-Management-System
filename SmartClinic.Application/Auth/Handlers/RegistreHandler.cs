using BCrypt.Net;
using SmartClinic.Application.Auth.Commands;
using SmartClinic.Application.Auth.DTOs;
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
        var exists = await _userRepo.ExistsByEmailAsync(command.Email);
        if (exists)
            throw new Exception("Email already registered.");

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(command.Password);

        var user = new User
        {
            FirstName = command.FirstName,
            LastName = command.LastName,
            Email = command.Email,
            PasswordHash = passwordHash,
            Phone = command.Phone,
            RoleId = command.RoleId,
            ClinicId = command.ClinicId,
            Status = "Active"
        };

        await _userRepo.AddAsync(user);
        await _userRepo.SaveChangesAsync();

        var role = await _userRepo.GetRoleNameAsync(command.RoleId);
        var token = _jwtService.GenerateToken(user, role);

        return new AuthResult(token, user.Email, $"{user.FirstName} {user.LastName}", role);
    }
}