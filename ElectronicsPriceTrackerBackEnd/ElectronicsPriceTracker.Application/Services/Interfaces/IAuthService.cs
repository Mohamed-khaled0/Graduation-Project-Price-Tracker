using ElectronicsPriceTracker.Application.DTOs;
using System.Threading.Tasks;

namespace ElectronicsPriceTracker.Application.Services.Interfaces
{
    public interface IAuthService
    {
        Task<UserResponseDTO> RegisterAsync(RegisterUserDTO registerDto);
        Task<AuthResponseDTO> LoginAsync(LoginUserDTO loginDto);
        Task<bool> ChangePasswordAsync(string userId, string currentPassword, string newPassword);
        Task<AuthResponseDTO> RefreshTokenAsync(string token, string refreshToken);
    }
} 