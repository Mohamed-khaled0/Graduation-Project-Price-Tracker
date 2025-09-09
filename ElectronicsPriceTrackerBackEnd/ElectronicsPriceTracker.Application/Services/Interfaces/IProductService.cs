using ElectronicsPriceTracker.Application.DTOs;
using ElectronicsPriceTracker.Domain.Entities;

namespace ElectronicsPriceTracker.Application.Services.Interfaces;

public interface IProductService
{
    Task<IEnumerable<Product>> GetAllProductsAsync();
    Task<Product?> GetProductByIdAsync(int id);
    Task AddProductAsync(Product product);
    Task UpdateProductAsync(Product product);
    Task DeleteProductAsync(int id);

    Task<(IEnumerable<ProductResponseDto> Items, int TotalCount)> GetPagedProductsAsync(
        int pageNumber,
        int pageSize,
        ProductFilterDto? filters = null
    );

    Task<(IEnumerable<ProductResponseDto> Items, int TotalCount)> SearchProductsAsync(
        string searchTerm,
        int pageNumber,
        int pageSize,
        ProductFilterDto? filters = null
    );

    Task<IEnumerable<PriceHistoryPointDto>> GetPriceHistoryForProductAsync(int productId);
}
