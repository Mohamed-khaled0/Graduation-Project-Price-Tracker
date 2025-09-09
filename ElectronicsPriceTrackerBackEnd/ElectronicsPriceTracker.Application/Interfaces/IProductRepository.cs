using System.Linq.Expressions;
using ElectronicsPriceTracker.Application.DTOs; 
using ElectronicsPriceTracker.Domain.Entities;

namespace ElectronicsPriceTracker.Application.Interfaces
{
    public interface IProductRepository : IGenericRepository<Product>
    {
        Task<(IEnumerable<ProductResponseDto> Items, int TotalCount)> GetPagedWithIncludesAsync(
            int pageNumber,
            int pageSize,
            Expression<Func<Product, bool>>? predicate = null,
            ProductFilterDto? filters = null, 
            Expression<Func<Product, object>>? orderBy = null,
            bool sortDescending = false
        );

        Task<Product?> GetByIdWithIncludesAsync(int id);
    }
}
