namespace ElectronicsPriceTracker.Domain.Entities;

public class Listing
{
    #region Properties

    public int ListingId { get; set; }
    public float CurrentPrice { get; set; }
    public string Url { get; set; } = string.Empty;

    // Foreign Keys
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int PlatformId { get; set; }
    public Platform Platform { get; set; } = null!;

    // Relations
    public ICollection<PriceHistory> PriceHistories { get; set; } = new List<PriceHistory>();

    #endregion
}