using ElectronicsPriceTracker.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ElectronicsPriceTracker.Application.Services.Interfaces
{
    public interface ISecondHandListingService
    {
        Task<IEnumerable<SecondHandListing>> GetAllAsync();
        Task<SecondHandListing> GetByIdAsync(int id);
        Task AddAsync(SecondHandListing listing);
        Task UpdateAsync(SecondHandListing listing);
        Task DeleteAsync(int id);
    }
}
