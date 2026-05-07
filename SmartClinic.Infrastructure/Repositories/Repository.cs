using Microsoft.EntityFrameworkCore;
using SmartClinic.Application.Interfaces;
using SmartClinic.Infrastructure.Data;

namespace SmartClinic.Infrastructure.Repositories;

public class Repository<T> : IRepository<T> where T : class
{
    private readonly ApplicationDbContext _context;

    public Repository(ApplicationDbContext context)
    {
        _context = context;
    }

    public IQueryable<T> Query()
        => _context.Set<T>().AsNoTracking();

    public async Task<IEnumerable<T>> GetAllAsync()
        => await _context.Set<T>().ToListAsync();

    public async Task<T?> GetByIdAsync(int id)
        => await _context.Set<T>().FindAsync(id);

    public async Task AddAsync(T entity)
        => await _context.Set<T>().AddAsync(entity);

    public void Update(T entity)
        => _context.Set<T>().Update(entity);

    public void Delete(T entity)
        => _context.Set<T>().Remove(entity);

    public async Task SaveChangesAsync()
        => await _context.SaveChangesAsync();
}