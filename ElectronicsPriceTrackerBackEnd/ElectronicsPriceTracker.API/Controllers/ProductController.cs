using ElectronicsPriceTracker.Application.DTOs;
using ElectronicsPriceTracker.Application.Services.Interfaces;
using ElectronicsPriceTracker.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace ElectronicsPriceTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductResponseDto>>> GetAllLegacy(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10
    )
    {
        var (items, totalCount) = await _productService.GetPagedProductsAsync(page, pageSize);
        return Ok(
            new
            {
                TotalCount = totalCount,
                PageNumber = page,
                PageSize = pageSize,
                Items = items,
            }
        );
    }

    [HttpGet("paged")]
    public async Task<IActionResult> GetPagedProducts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] float? minPrice = null,
        [FromQuery] float? maxPrice = null,
        [FromQuery] string? categories = null,
        [FromQuery] string? platforms = null
    )
    {
        var filters = new ProductFilterDto
        {
            MinPrice = minPrice,
            MaxPrice = maxPrice,
            SelectedCategories = !string.IsNullOrWhiteSpace(categories)
                ? categories.Split(',').ToList()
                : null,
            SelectedPlatforms = !string.IsNullOrWhiteSpace(platforms)
                ? platforms.Split(',').ToList()
                : null,
        };

        var (items, totalCount) = await _productService.GetPagedProductsAsync(
            page,
            pageSize,
            filters
        );
        return Ok(
            new
            {
                TotalCount = totalCount,
                PageNumber = page,
                PageSize = pageSize,
                Items = items,
            }
        );
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchProducts(
        [FromQuery] string searchTerm,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] float? minPrice = null,
        [FromQuery] float? maxPrice = null,
        [FromQuery] string? categories = null,
        [FromQuery] string? platforms = null
    )
    {
        var filters = new ProductFilterDto
        {
            MinPrice = minPrice,
            MaxPrice = maxPrice,
            SelectedCategories = !string.IsNullOrWhiteSpace(categories)
                ? categories.Split(',').ToList()
                : null,
            SelectedPlatforms = !string.IsNullOrWhiteSpace(platforms)
                ? platforms.Split(',').ToList()
                : null,
        };

        if (string.IsNullOrWhiteSpace(searchTerm))
        {
            var (pagedItems, pagedTotalCount) = await _productService.GetPagedProductsAsync(
                page,
                pageSize,
                filters
            );
            return Ok(
                new
                {
                    TotalCount = pagedTotalCount,
                    PageNumber = page,
                    PageSize = pageSize,
                    Items = pagedItems,
                }
            );
        }

        var (items, totalCount) = await _productService.SearchProductsAsync(
            searchTerm,
            page,
            pageSize,
            filters
        );
        return Ok(
            new
            {
                TotalCount = totalCount,
                PageNumber = page,
                PageSize = pageSize,
                Items = items,
            }
        );
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductResponseDto>> GetById(int id)
    {
        var product = await _productService.GetProductByIdAsync(id);
        if (product == null)
            return NotFound();

        var primaryListing = product.Listings?.OrderBy(l => l.CurrentPrice).FirstOrDefault();

        var response = new ProductResponseDto
        {
            ProductId = product.ProductId,
            Name = product.Name,
            Category = product.Category,
            ImageUrl = product.ImageUrl,
            CurrentPrice = primaryListing?.CurrentPrice ?? 0f,
            ProductUrl = primaryListing?.Url,
            PlatformName = primaryListing?.Platform?.Name,
            PlatformLogoUrl = primaryListing?.Platform?.LogoUrl,
        };
        return Ok(response);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ProductCreateDto dto)
    {
        var product = new Product { Name = dto.Name, Category = dto.Category };
        await _productService.AddProductAsync(product);

        var responseDto = new ProductResponseDto
        {
            ProductId = product.ProductId,
            Name = product.Name,
            Category = product.Category,
            ImageUrl = product.ImageUrl,
        };
        return CreatedAtAction(nameof(GetById), new { id = product.ProductId }, responseDto);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] ProductUpdateDto dto)
    {
        if (id != dto.ProductId)
            return BadRequest("Mismatched product ID.");

        var existing = await _productService.GetProductByIdAsync(id);
        if (existing == null)
            return NotFound();

        existing.Name = dto.Name;
        existing.Category = dto.Category;

        await _productService.UpdateProductAsync(existing);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var existing = await _productService.GetProductByIdAsync(id);
        if (existing == null)
            return NotFound();

        await _productService.DeleteProductAsync(id);
        return NoContent();
    }

    [HttpGet("{productId}/pricehistory")]
    public async Task<ActionResult<IEnumerable<PriceHistoryPointDto>>> GetProductPriceHistory(
        int productId
    )
    {
        var history = await _productService.GetPriceHistoryForProductAsync(productId);
        if (!history.Any())
        {
            return Ok(new List<PriceHistoryPointDto>());
        }
        return Ok(history);
    }
}
