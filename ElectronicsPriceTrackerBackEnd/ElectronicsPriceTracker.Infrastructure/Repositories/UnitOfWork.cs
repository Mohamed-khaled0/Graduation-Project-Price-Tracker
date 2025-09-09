

using ElectronicsPriceTracker.Application.Interfaces;
using ElectronicsPriceTracker.Infrastructure.DBContext;

namespace ElectronicsPriceTracker.Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context;

        public UnitOfWork(AppDbContext context)
        {
            _context = context;

            Products = new ProductRepository(_context);
            Platforms = new PlatformRepository(_context);
            Listings = new ListingRepository(_context);
            PriceHistories = new PriceHistoryRepository(_context);
            SecondHandListings = new SecondHandListingRepository(_context);
            Watchlists = new WatchlistRepository(_context);
            Users = new UserRepository(_context);
        }

        public IProductRepository Products { get; private set; }
        public IPlatformRepository Platforms { get; private set; }
        public IListingRepository Listings { get; private set; }
        public IPriceHistoryRepository PriceHistories { get; private set; }
        public ISecondHandListingRepository SecondHandListings { get; private set; }
        public IWatchlistRepository Watchlists { get; private set; }
        public IUserRepository Users { get; private set; }

        public async Task<int> SaveAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }

}
