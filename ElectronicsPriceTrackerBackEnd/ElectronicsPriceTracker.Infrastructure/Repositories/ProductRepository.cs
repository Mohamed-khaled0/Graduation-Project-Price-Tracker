using System.Linq.Expressions;
using ElectronicsPriceTracker.Application.DTOs;
using ElectronicsPriceTracker.Application.Interfaces;
using ElectronicsPriceTracker.Domain.Entities;
using ElectronicsPriceTracker.Infrastructure.DBContext;
using Microsoft.EntityFrameworkCore;

namespace ElectronicsPriceTracker.Infrastructure.Repositories;

public class ProductRepository : GenericRepository<Product>, IProductRepository
{
    public ProductRepository(AppDbContext context)
        : base(context)
    {
    }

    public async Task<(IEnumerable<ProductResponseDto> Items, int TotalCount)> GetPagedWithIncludesAsync(
        int pageNumber,
        int pageSize,
        Expression<Func<Product, bool>>? predicate = null,
        ProductFilterDto? filters = null,
        Expression<Func<Product, object>>? orderBy = null,
        bool sortDescending = false
    )
    {
        if (pageNumber < 1)
            throw new ArgumentException("Page number must be greater than 0", nameof(pageNumber));
        if (pageSize < 1)
            throw new ArgumentException("Page size must be greater than 0", nameof(pageSize));

        var query = _context.Products.AsQueryable();

        if (predicate != null) query = query.Where(predicate);

        if (filters?.SelectedCategories?.Any() == true)
            query = query.Where(p => filters.SelectedCategories.Contains(p.Category));

        query = query.Where(p => p.Listings.Any(l => l.CurrentPrice > 0));

        if (
            filters?.SelectedPlatforms?.Any() == true
            || filters?.MinPrice.HasValue == true
            || filters?.MaxPrice.HasValue == true
        )
            query = query.Where(p =>
                p.Listings.Any(l =>
                    (
                        filters.SelectedPlatforms == null
                        || !filters.SelectedPlatforms.Any()
                        || filters.SelectedPlatforms.Contains(l.Platform.Name)
                    )
                    && (filters.MinPrice == null || l.CurrentPrice >= filters.MinPrice.Value)
                    && (filters.MaxPrice == null || l.CurrentPrice <= filters.MaxPrice.Value)
                )
            );

        var totalCount = await query.CountAsync();

        if (orderBy != null)
            query = sortDescending ? query.OrderByDescending(orderBy) : query.OrderBy(orderBy);
        else
            query = query.OrderBy(p => p.Name);

        var pagedProductEntities = await query
            .Include(p => p.Listings)
            .ThenInclude(l => l.Platform)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var items = pagedProductEntities
            .Select(product =>
            {
                var qualifyingListingsForDto = product.Listings.AsQueryable();

                if (filters?.SelectedPlatforms?.Any() == true)
                    qualifyingListingsForDto = qualifyingListingsForDto.Where(l =>
                        filters.SelectedPlatforms.Contains(l.Platform.Name)
                    );
                if (filters?.MinPrice.HasValue == true)
                    qualifyingListingsForDto = qualifyingListingsForDto.Where(l =>
                        l.CurrentPrice >= filters.MinPrice.Value
                    );
                if (filters?.MaxPrice.HasValue == true)
                    qualifyingListingsForDto = qualifyingListingsForDto.Where(l =>
                        l.CurrentPrice <= filters.MaxPrice.Value
                    );

                var bestQualifyingListing = qualifyingListingsForDto
                    .OrderBy(l => l.CurrentPrice)
                    .FirstOrDefault();

                if (bestQualifyingListing == null)
                    bestQualifyingListing = product
                        .Listings.OrderBy(l => l.CurrentPrice)
                        .FirstOrDefault();

                return new ProductResponseDto
                {
                    ProductId = product.ProductId,
                    Name = product.Name,
                    Category = product.Category,
                    ImageUrl = product.ImageUrl,
                    CurrentPrice = bestQualifyingListing?.CurrentPrice ?? 0f,
                    ProductUrl = bestQualifyingListing?.Url,
                    PlatformName = bestQualifyingListing?.Platform?.Name,
                    PlatformLogoUrl = bestQualifyingListing?.Platform?.LogoUrl
                };
            })
            .ToList();

        return (items, totalCount);
    }

    public async Task<Product?> GetByIdWithIncludesAsync(int id)
    {
        return await _context
            .Products.Include(p => p.Listings)
            .ThenInclude(l => l.Platform)
            .FirstOrDefaultAsync(p => p.ProductId == id);
    }

    public IQueryable<Product> Query()
    {
        return _context.Products.AsQueryable();
    }
}