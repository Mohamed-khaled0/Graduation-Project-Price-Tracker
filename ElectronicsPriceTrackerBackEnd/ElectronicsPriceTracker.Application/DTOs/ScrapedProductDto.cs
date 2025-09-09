using System.ComponentModel.DataAnnotations;

namespace ElectronicsPriceTracker.Application.DTOs;

public class ScrapedProductDto
{
    [Required] public string ProductTitle { get; set; }

    public string? ProductPrice { get; set; }

    [Required] public string ProductUrl { get; set; }

    public string? ProductImageUrl { get; set; }

    public string? ProductImageLocalPath { get; set; }

    [Required] public string PlatformName { get; set; }

    public string? CategoryName { get; set; }

    public string? CategoryNmae { get; set; }
}