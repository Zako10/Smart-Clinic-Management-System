using SmartClinic.Domain.Entities;

namespace SmartClinic.Application.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<bool> ExistsByEmailAsync(string email);
    Task<string?> GetRoleNameAsync(int roleId);
    Task<Role?> GetRoleByNameAsync(string roleName);
    Task<bool> ClinicExistsAsync(int clinicId);
    Task AddAsync(User user);
    Task SaveChangesAsync();
}
