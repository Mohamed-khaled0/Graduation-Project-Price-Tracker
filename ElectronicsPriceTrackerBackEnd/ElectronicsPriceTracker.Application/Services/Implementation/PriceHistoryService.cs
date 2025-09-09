using ElectronicsPriceTracker.Application.Interfaces;
using ElectronicsPriceTracker.Application.Services.Interfaces;
using ElectronicsPriceTracker.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ElectronicsPriceTracker.Application.Services.Implementation
{
    public class PriceHistoryService : IPriceHistoryService
    {
        private readonly IUnitOfWork _unitOfWork;

        public PriceHistoryService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<PriceHistory>> GetAllPriceHistoriesAsync()
        {
            return await _unitOfWork.PriceHistories.GetAllAsync();
        }

        public async Task<PriceHistory> GetPriceHistoryByIdAsync(int id)
        {
            return await _unitOfWork.PriceHistories.GetByIdAsync(id);
        }

        public async Task AddPriceHistoryAsync(PriceHistory priceHistory)
        {
            await _unitOfWork.PriceHistories.AddAsync(priceHistory);
            await _unitOfWork.SaveAsync();
        }

        public async Task UpdatePriceHistoryAsync(PriceHistory priceHistory)
        {
            _unitOfWork.PriceHistories.Update(priceHistory);
            await _unitOfWork.SaveAsync();
        }

        public async Task DeletePriceHistoryAsync(int id)
        {
            var priceHistory = await _unitOfWork.PriceHistories.GetByIdAsync(id);
            if (priceHistory != null)
            {
                _unitOfWork.PriceHistories.Delete(priceHistory);
                await _unitOfWork.SaveAsync();
            }
        }
    }
}
