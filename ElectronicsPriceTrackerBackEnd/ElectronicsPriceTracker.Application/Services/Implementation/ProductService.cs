using AutoMapper;
using ElectronicsPriceTracker.Application.DTOs;
using ElectronicsPriceTracker.Application.Interfaces;
using ElectronicsPriceTracker.Application.Services.Interfaces;
using ElectronicsPriceTracker.Domain.Entities;

namespace ElectronicsPriceTracker.Application.Services.Implementation;

public class ProductService : IProductService
{
    private readonly IMapper _mapper;
    private readonly IUnitOfWork _unitOfWork;

    public ProductService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<(IEnumerable<ProductResponseDto> Items, int TotalCount)> GetPagedProductsAsync(
        int pageNumber,
        int pageSize,
        ProductFilterDto? filters = null
    )
    {
        var productRepository = _unitOfWork.Products;

        (IEnumerable<ProductResponseDto> productDtos, var totalCount) =
            await productRepository.GetPagedWithIncludesAsync(
                pageNumber,
                pageSize,
                filters: filters,
                orderBy: p => p.Name
            );

        return (productDtos, totalCount);
    }

    public async Task<(IEnumerable<ProductResponseDto> Items, int TotalCount)> SearchProductsAsync(
        string searchTerm,
        int pageNumber,
        int pageSize,
        ProductFilterDto? filters = null
    )
    {
        var productRepository = _unitOfWork.Products;

        (IEnumerable<ProductResponseDto> productDtos, var totalCount) =
            await productRepository.GetPagedWithIncludesAsync(
                pageNumber,
                pageSize,
                predicate: p => p.Name.ToLower().Contains(searchTerm.ToLower()),
                filters: filters,
                orderBy: p => p.Name
            );

        return (productDtos, totalCount);
    }

    public async Task<IEnumerable<PriceHistoryPointDto>> GetPriceHistoryForProductAsync(int productId)
    {
        var product = await _unitOfWork.Products.FindOneAsync(p => p.ProductId == productId);
        if (product == null)
            return Enumerable.Empty<PriceHistoryPointDto>();

        var listings = await _unitOfWork.Listings.GetListingsByProductIdAsync(productId);
        var primaryListing = listings.OrderBy(l => l.CurrentPrice).FirstOrDefault();
        if (primaryListing == null)
            return Enumerable.Empty<PriceHistoryPointDto>();

        var history = await _unitOfWork.PriceHistories.GetPriceHistoriesByListingIdAsync(primaryListing.ListingId);

        return history
            .OrderBy(ph => ph.DateRecorded)
            .Select(ph => new PriceHistoryPointDto
            {
                Date = ph.DateRecorded,
                Price = ph.Price
            })
            .ToList();
    }

    public async Task<IEnumerable<Product>> GetAllProductsAsync()
    {
        return await _unitOfWork.Products.GetAllAsync();
    }

    public async Task<Product?> GetProductByIdAsync(int id)
    {
        return await _unitOfWork.Products.GetByIdWithIncludesAsync(id);
    }

    public async Task AddProductAsync(Product product)
    {
        await _unitOfWork.Products.AddAsync(product);
        await _unitOfWork.SaveAsync();
    }

    public async Task UpdateProductAsync(Product product)
    {
        _unitOfWork.Products.Update(product);
        await _unitOfWork.SaveAsync();
    }

    public async Task DeleteProductAsync(int id)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(id);
        if (product != null)
        {
            _unitOfWork.Products.Delete(product);
            await _unitOfWork.SaveAsync();
        }
    }
}
