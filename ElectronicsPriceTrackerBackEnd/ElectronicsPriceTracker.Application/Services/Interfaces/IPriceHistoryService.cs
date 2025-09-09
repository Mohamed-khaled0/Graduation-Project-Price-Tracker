using ElectronicsPriceTracker.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ElectronicsPriceTracker.Application.Services.Interfaces
{
    public interface IPriceHistoryService
    {
        Task<IEnumerable<PriceHistory>> GetAllPriceHistoriesAsync();
        Task<PriceHistory> GetPriceHistoryByIdAsync(int id);
        Task AddPriceHistoryAsync(PriceHistory priceHistory);
        Task UpdatePriceHistoryAsync(PriceHistory priceHistory);
        Task DeletePriceHistoryAsync(int id);
    }
}
