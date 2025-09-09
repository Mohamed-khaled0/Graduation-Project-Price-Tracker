using System.Collections.Generic;

namespace ElectronicsPriceTracker.Application.DTOs;

public class ProductDetailResponseDto
{
    public int ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public float Price { get; set; } 
    public List<PriceComparisonDetailDto> PriceComparisons { get; set; } = new List<PriceComparisonDetailDto>();
}
