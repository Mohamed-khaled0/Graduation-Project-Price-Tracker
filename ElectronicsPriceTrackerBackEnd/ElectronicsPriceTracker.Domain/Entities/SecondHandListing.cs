namespace ElectronicsPriceTracker.Domain.Entities
{
    public class SecondHandListing
    {
        #region Properties
        public int Id { get; set; }

        public int ProductId { get; set; }
        public Product Product { get; set; } = null!;

        public int PlatformId { get; set; }
        public Platform Platform { get; set; } = null!;
        #endregion
    }

}
