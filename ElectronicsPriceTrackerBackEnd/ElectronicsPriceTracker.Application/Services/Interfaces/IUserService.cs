using ElectronicsPriceTracker.Application.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ElectronicsPriceTracker.Application.Services.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<UserResponseDTO>> GetAllAsync();
        Task<UserResponseDTO> GetByIdAsync(string id);
        Task<UserResponseDTO> RegisterAsync(RegisterUserDTO registerDto);
        Task<bool> LoginAsync(LoginUserDTO loginDto);
        Task<UserResponseDTO> UpdateAsync(string id, UpdateUserDTO updateDto);
        Task<bool> DeleteAsync(string id);
    }
}
