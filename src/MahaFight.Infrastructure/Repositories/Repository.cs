using Microsoft.EntityFrameworkCore;
using MahaFight.Domain.Entities;
using MahaFight.Domain.Interfaces;
using MahaFight.Infrastructure.Data;

namespace MahaFight.Infrastructure.Repositories;

public class Repository<T> : IRepository<T> where T : BaseEntity
{
    private readonly ApplicationDbContext _context;
    private readonly DbSet<T> _dbSet;

    public Repository(ApplicationDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public async Task<T?> GetByIdAsync(Guid id) => await _dbSet.FindAsync(id);

    public async Task<IEnumerable<T>> GetAllAsync() => await _dbSet.ToListAsync();

    public async Task<IEnumerable<T>> GetByIdsAsync(IEnumerable<Guid> ids) => 
        await _dbSet.Where(x => ids.Contains(x.Id)).ToListAsync();

    public async Task<IEnumerable<T>> GetByCustomerIdAsync(Guid customerId)
    {
        if (typeof(T) == typeof(Order))
        {
            return await _dbSet.Cast<Order>()
                .Where(o => o.CustomerId == customerId)
                .Include(o => o.Items)
                .Cast<T>()
                .ToListAsync();
        }
        return new List<T>();
    }

    public async Task<Product?> GetByIdWithImagesAsync(Guid id)
    {
        return await _context.Products
            .Include(p => p.Images.OrderBy(img => img.DisplayOrder))
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<IEnumerable<Product>> GetAllWithImagesAsync()
    {
        return await _context.Products
            .Include(p => p.Images.OrderBy(img => img.DisplayOrder))
            .ToListAsync();
    }

    public async Task<T> AddAsync(T entity)
    {
        await _dbSet.AddAsync(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public async Task UpdateAsync(T entity)
    {
        entity.UpdatedAt = DateTime.UtcNow;
        _dbSet.Update(entity);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var entity = await GetByIdAsync(id);
        if (entity != null)
        {
            _dbSet.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }
}