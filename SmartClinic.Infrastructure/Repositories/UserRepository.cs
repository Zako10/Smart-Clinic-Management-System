using Microsoft.EntityFrameworkCore;
using SmartClinic.Application.Interfaces;
using SmartClinic.Domain.Entities;
using SmartClinic.Infrastructure.Data;

namespace SmartClinic.Infrastructure.Repositories;

public class UserRepository : Repository<User>, IUserRepository
{
    private readonly ApplicationDbContext _db;

    public UserRepository(ApplicationDbContext context) : base(context)
    {
        _db = context;
    }

    public async Task<User?> GetByEmailAsync(string email)
        => await _db.Users.FirstOrDefaultAsync(u => u.Email == email);

    public async Task<bool> ExistsByEmailAsync(string email)
        => await _db.Users.AnyAsync(u => u.Email == email);

    public async Task<string> GetRoleNameAsync(int roleId)
    {
        var role = await _db.Roles.FindAsync(roleId);
        return role?.Name ?? "Unknown";
    }

    public async Task AddAsync(User user)
        => await _db.Users.AddAsync(user);

    public async Task SaveChangesAsync()
        => await _db.SaveChangesAsync();
}