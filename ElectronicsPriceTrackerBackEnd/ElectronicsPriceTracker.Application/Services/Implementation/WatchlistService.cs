using ElectronicsPriceTracker.Application.Interfaces;
using ElectronicsPriceTracker.Application.Services.Interfaces;
using ElectronicsPriceTracker.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ElectronicsPriceTracker.Application.Services.Implementation
{
    public class WatchlistService : IWatchlistService
    {
        private readonly IUnitOfWork _unitOfWork;

        public WatchlistService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<Watchlist>> GetAllAsync()
        {
            return await _unitOfWork.Watchlists.GetAllAsync();
        }

        public async Task<Watchlist> GetByIdAsync(int id)
        {
            return await _unitOfWork.Watchlists.GetByIdAsync(id);
        }

        public async Task AddAsync(Watchlist watchlist)
        {
            await _unitOfWork.Watchlists.AddAsync(watchlist);
            await _unitOfWork.SaveAsync();
        }

        public async Task UpdateAsync(Watchlist watchlist)
        {
            _unitOfWork.Watchlists.Update(watchlist);
            await _unitOfWork.SaveAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _unitOfWork.Watchlists.GetByIdAsync(id);
            if (entity != null)
            {
                _unitOfWork.Watchlists.Delete(entity);
                await _unitOfWork.SaveAsync();
            }
        }
    }
}
