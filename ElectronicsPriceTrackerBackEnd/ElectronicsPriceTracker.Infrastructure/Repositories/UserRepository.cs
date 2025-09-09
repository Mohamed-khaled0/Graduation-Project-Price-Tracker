using ElectronicsPriceTracker.Application.Interfaces;
using ElectronicsPriceTracker.Domain.Entities;
using ElectronicsPriceTracker.Entities;
using ElectronicsPriceTracker.Infrastructure.DBContext;

namespace ElectronicsPriceTracker.Infrastructure.Repositories
{
    public class UserRepository : GenericRepository<ApplicationUser>, IUserRepository
    {
        public UserRepository(AppDbContext context) : base(context) { }
    }
}
