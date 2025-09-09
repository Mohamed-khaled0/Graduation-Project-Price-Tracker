using ElectronicsPriceTracker.Application.Interfaces;
using ElectronicsPriceTracker.Domain.Entities;
using ElectronicsPriceTracker.Entities;
using ElectronicsPriceTracker.Infrastructure.DBContext;

namespace ElectronicsPriceTracker.Infrastructure.Repositories
{
    public class SecondHandListingRepository : GenericRepository<SecondHandListing>, ISecondHandListingRepository
    {
        public SecondHandListingRepository(AppDbContext context) : base(context) { }
    }
}
