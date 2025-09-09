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
    public class ListingService : IListingService
    {
        private readonly IUnitOfWork _unitOfWork;

        public ListingService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<Listing>> GetAllListingsAsync()
        {
            return await _unitOfWork.Listings.GetAllAsync();
        }

        public async Task<Listing> GetListingByIdAsync(int id)
        {
            return await _unitOfWork.Listings.GetByIdAsync(id);
        }

        public async Task AddListingAsync(Listing listing)
        {
            await _unitOfWork.Listings.AddAsync(listing);
            await _unitOfWork.SaveAsync();
        }

        public async Task UpdateListingAsync(Listing listing)
        {
            _unitOfWork.Listings.Update(listing);
            await _unitOfWork.SaveAsync();
        }

        public async Task DeleteListingAsync(int id)
        {
            var listing = await _unitOfWork.Listings.GetByIdAsync(id);
            if (listing != null)
            {
                _unitOfWork.Listings.Delete(listing);
                await _unitOfWork.SaveAsync();
            }
        }
    }
}
