using ElectronicsPriceTracker.Entities;

namespace ElectronicsPriceTracker.Domain.Entities;

public class Product
{
    #region Properties

    public int ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;

    public string? ImageUrl { get; set; }

    public string? ScrapedImageLocalPath { get; set; }

    // Relations
    public ICollection<Listing> Listings { get; set; } = new List<Listing>();
    public ICollection<SecondHandListing> SecondHandListings { get; set; } = new List<SecondHandListing>();
    public ICollection<Watchlist> Watchlists { get; set; } = new List<Watchlist>();

    #endregion
}