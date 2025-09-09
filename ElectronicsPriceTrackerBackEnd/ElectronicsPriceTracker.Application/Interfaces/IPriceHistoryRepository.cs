using ElectronicsPriceTracker.Domain.Entities;
using ElectronicsPriceTracker.Entities;

namespace ElectronicsPriceTracker.Application.Interfaces
{
    public interface IPriceHistoryRepository : IGenericRepository<PriceHistory>
    {
        Task<IEnumerable<PriceHistory>> GetPriceHistoriesByListingIdAsync(int listingId);
    }
}
