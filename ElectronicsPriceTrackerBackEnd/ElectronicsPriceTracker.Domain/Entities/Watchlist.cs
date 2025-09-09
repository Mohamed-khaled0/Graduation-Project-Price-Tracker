using ElectronicsPriceTracker.Domain.Entities;

namespace ElectronicsPriceTracker.Entities
{
    public class Watchlist
    {
        #region Properties
        public int WatchlistId { get; set; }

        public string UserId { get; set; }
        public ApplicationUser User { get; set; } = null!;

        public int ProductId { get; set; }
        public Product Product { get; set; } = null!;
        #endregion
    }

}
