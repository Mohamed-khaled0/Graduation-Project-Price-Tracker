using ElectronicsPriceTracker.Domain.Entities;

namespace ElectronicsPriceTracker.Application.Interfaces
{
    public interface IListingRepository : IGenericRepository<Listing>
    {
        Task<IEnumerable<Listing>> GetListingsByProductIdAsync(int productId);
    }
}
