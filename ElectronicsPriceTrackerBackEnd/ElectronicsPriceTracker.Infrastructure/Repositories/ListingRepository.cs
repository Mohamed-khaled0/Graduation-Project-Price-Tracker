using ElectronicsPriceTracker.Application.Interfaces;
using ElectronicsPriceTracker.Domain.Entities;
using ElectronicsPriceTracker.Entities;
using ElectronicsPriceTracker.Infrastructure.DBContext;
using Microsoft.EntityFrameworkCore;

namespace ElectronicsPriceTracker.Infrastructure.Repositories
{
    public class ListingRepository : GenericRepository<Listing>, IListingRepository
    {
        public ListingRepository(AppDbContext context)
            : base(context) { }

        public async Task<IEnumerable<Listing>> GetListingsByProductIdAsync(int productId)
        {
            return await _dbSet.Where(l => l.ProductId == productId).ToListAsync();
        }
    }
}
