using MahaFight.Domain.Entities;

namespace MahaFight.Domain.Interfaces;

public interface IRepository<T> where T : BaseEntity
{
    Task<T?> GetByIdAsync(Guid id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<IEnumerable<T>> GetByIdsAsync(IEnumerable<Guid> ids);
    Task<IEnumerable<T>> GetByCustomerIdAsync(Guid customerId);
    Task<T> AddAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(Guid id);
    Task<Product?> GetByIdWithImagesAsync(Guid id);
    Task<IEnumerable<Product>> GetAllWithImagesAsync();
}