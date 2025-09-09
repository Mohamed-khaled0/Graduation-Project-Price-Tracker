namespace ElectronicsPriceTracker.Application.DTOs;

public class PriceComparisonDetailDto
{
    public string Store { get; set; } = string.Empty;
    public float Price { get; set; }
    public string Url { get; set; } = string.Empty;
}
