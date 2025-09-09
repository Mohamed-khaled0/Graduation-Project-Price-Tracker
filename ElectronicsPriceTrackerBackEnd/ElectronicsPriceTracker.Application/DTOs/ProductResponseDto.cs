namespace ElectronicsPriceTracker.Application.DTOs;

public class ProductResponseDto
{
    public int ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public float CurrentPrice { get; set; }
    public string? ProductUrl { get; set; }
    public string? PlatformName { get; set; }
    public string? PlatformLogoUrl { get; set; }
}

