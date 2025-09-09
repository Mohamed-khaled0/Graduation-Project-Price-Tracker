
using ElectronicsPriceTracker.Application.Interfaces;
using ElectronicsPriceTracker.Entities;
using ElectronicsPriceTracker.Infrastructure.DBContext;

namespace ElectronicsPriceTracker.Infrastructure.Repositories
{
    public class WatchlistRepository : GenericRepository<Watchlist>, IWatchlistRepository
    {
        public WatchlistRepository(AppDbContext context) : base(context) { }
    }
}
