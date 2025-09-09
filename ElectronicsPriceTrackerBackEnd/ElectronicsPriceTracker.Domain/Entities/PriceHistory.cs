namespace ElectronicsPriceTracker.Domain.Entities
{
    public class PriceHistory
    {
        #region Properties
        public int Id { get; set; }
        public int ListingId { get; set; }
        public Listing Listing { get; set; } = null!;
        public float Price { get; set; }
        public DateTime DateRecorded { get; set; }
        #endregion
    }

}
