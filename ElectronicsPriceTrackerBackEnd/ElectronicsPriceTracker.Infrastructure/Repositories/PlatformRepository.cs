

using ElectronicsPriceTracker.Application.Interfaces;
using ElectronicsPriceTracker.Domain.Entities;
using ElectronicsPriceTracker.Infrastructure.DBContext;

namespace ElectronicsPriceTracker.Infrastructure.Repositories
{
    public class PlatformRepository : GenericRepository<Platform>, IPlatformRepository
    {
        public PlatformRepository(AppDbContext context) : base(context) { }
    }
}
