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
    public class SecondHandListingService : ISecondHandListingService
    {
        private readonly IUnitOfWork _unitOfWork;

        public SecondHandListingService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<SecondHandListing>> GetAllAsync()
        {
            return await _unitOfWork.SecondHandListings.GetAllAsync();
        }

        public async Task<SecondHandListing> GetByIdAsync(int id)
        {
            return await _unitOfWork.SecondHandListings.GetByIdAsync(id);
        }

        public async Task AddAsync(SecondHandListing listing)
        {
            await _unitOfWork.SecondHandListings.AddAsync(listing);
            await _unitOfWork.SaveAsync();
        }

        public async Task UpdateAsync(SecondHandListing listing)
        {
            _unitOfWork.SecondHandListings.Update(listing);
            await _unitOfWork.SaveAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _unitOfWork.SecondHandListings.GetByIdAsync(id);
            if (entity != null)
            {
                _unitOfWork.SecondHandListings.Delete(entity);
                await _unitOfWork.SaveAsync();
            }
        }
    }
}
