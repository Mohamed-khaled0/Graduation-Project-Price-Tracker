using ElectronicsPriceTracker.Application.Interfaces;
using ElectronicsPriceTracker.Domain.Entities;
using ElectronicsPriceTracker.Entities;
using ElectronicsPriceTracker.Infrastructure.DBContext;
using Microsoft.EntityFrameworkCore;

namespace ElectronicsPriceTracker.Infrastructure.Repositories
{
    public class PriceHistoryRepository : GenericRepository<PriceHistory>, IPriceHistoryRepository
    {
        public PriceHistoryRepository(AppDbContext context)
            : base(context) { }

        public async Task<IEnumerable<PriceHistory>> GetPriceHistoriesByListingIdAsync(
            int listingId
        )
        {
            return await _dbSet
                .Where(ph => ph.ListingId == listingId)
                .OrderBy(ph => ph.DateRecorded)
                .ToListAsync();
        }
    }
}
