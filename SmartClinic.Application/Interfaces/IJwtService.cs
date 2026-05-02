using SmartClinic.Domain.Entities;

namespace SmartClinic.Application.Interfaces;

public interface IJwtService
{
    string GenerateToken(User user, string role);
}