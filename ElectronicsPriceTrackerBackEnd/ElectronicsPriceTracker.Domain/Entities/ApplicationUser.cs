using Microsoft.AspNetCore.Identity;
using ElectronicsPriceTracker.Entities;

namespace ElectronicsPriceTracker.Domain.Entities
{
    public class ApplicationUser : IdentityUser
    {
        public string Name { get; set; } = string.Empty;
        
        // Relations
        public ICollection<Watchlist> Watchlists { get; set; } = new List<Watchlist>();
    }
} 