using ElectronicsPriceTracker.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ElectronicsPriceTracker.Application.Services.Interfaces
{
    public interface IWatchlistService
    {
        Task<IEnumerable<Watchlist>> GetAllAsync();
        Task<Watchlist> GetByIdAsync(int id);
        Task AddAsync(Watchlist watchlist);
        Task UpdateAsync(Watchlist watchlist);
        Task DeleteAsync(int id);
    }
}
