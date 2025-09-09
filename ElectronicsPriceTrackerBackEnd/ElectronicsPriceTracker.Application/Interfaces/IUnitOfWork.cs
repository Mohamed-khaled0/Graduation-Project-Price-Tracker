namespace ElectronicsPriceTracker.Application.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IProductRepository Products { get; }
        IPlatformRepository Platforms { get; }
        IListingRepository Listings { get; }
        IPriceHistoryRepository PriceHistories { get; }
        ISecondHandListingRepository SecondHandListings { get; }
        IWatchlistRepository Watchlists { get; }
        IUserRepository Users { get; }

        Task<int> SaveAsync();
    }

}
