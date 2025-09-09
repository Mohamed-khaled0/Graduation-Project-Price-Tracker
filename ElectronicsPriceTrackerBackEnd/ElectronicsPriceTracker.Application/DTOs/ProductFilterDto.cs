namespace ElectronicsPriceTracker.Application.DTOs
{
    public class ProductFilterDto
    {
        public float? MinPrice { get; set; }
        public float? MaxPrice { get; set; }
        public List<string>? SelectedCategories { get; set; }
        public List<string>? SelectedPlatforms { get; set; }
    }
}
