using System.Collections.Generic;
using System.Reflection;

namespace ElectronicsPriceTracker.Domain.Entities
{
    public class Platform
    {
        #region Properties
        public int PlatformId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public string? LogoUrl { get; set; }

        // Relations
        public ICollection<Listing> Listings { get; set; } = new List<Listing>();
        #endregion
    }

}
