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
    public class PlatformService : IPlatformService
    {
        private readonly IUnitOfWork _unitOfWork;

        public PlatformService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<Platform>> GetAllPlatformsAsync()
        {
            return await _unitOfWork.Platforms.GetAllAsync();
        }

        public async Task<Platform> GetPlatformByIdAsync(int id)
        {
            return await _unitOfWork.Platforms.GetByIdAsync(id);
        }

        public async Task AddPlatformAsync(Platform platform)
        {
            await _unitOfWork.Platforms.AddAsync(platform);
            await _unitOfWork.SaveAsync();
        }

        public async Task UpdatePlatformAsync(Platform platform)
        {
            _unitOfWork.Platforms.Update(platform);
            await _unitOfWork.SaveAsync();
        }

        public async Task DeletePlatformAsync(int id)
        {
            var platform = await _unitOfWork.Platforms.GetByIdAsync(id);
            if (platform != null)
            {
                _unitOfWork.Platforms.Delete(platform);
                await _unitOfWork.SaveAsync();
            }
        }
    }
}
