using ElectronicsPriceTracker.Domain.Entities;
using ElectronicsPriceTracker.Application.Services.Interfaces;
using ElectronicsPriceTracker.Application.DTOs;
using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace ElectronicsPriceTracker.Application.Services.Implementation
{
    public class UserService : IUserService
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public UserService(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<IEnumerable<UserResponseDTO>> GetAllAsync()
        {
            var users = _userManager.Users.ToList();
            return users.Select(u => new UserResponseDTO
            {
                Id = u.Id,
                Email = u.Email,
                Username = u.UserName
            });
        }

        public async Task<UserResponseDTO> GetByIdAsync(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return null;

            return new UserResponseDTO
            {
                Id = user.Id,
                Email = user.Email,
                Username = user.UserName
            };
        }

        public async Task<UserResponseDTO> RegisterAsync(RegisterUserDTO registerDto)
        {
            var user = new ApplicationUser
            {
                UserName = registerDto.Username,
                Email = registerDto.Email
            };

            var result = await _userManager.CreateAsync(user, registerDto.Password);
            if (!result.Succeeded) return null;

            return new UserResponseDTO
            {
                Id = user.Id,
                Email = user.Email,
                Username = user.UserName
            };
        }

        public async Task<bool> LoginAsync(LoginUserDTO loginDto)
        {
            var user = await _userManager.FindByEmailAsync(loginDto.Email);
            if (user == null) return false;

            return await _userManager.CheckPasswordAsync(user, loginDto.Password);
        }

        public async Task<UserResponseDTO> UpdateAsync(string id, UpdateUserDTO updateDto)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return null;

            if (!string.IsNullOrEmpty(updateDto.Email))
                user.Email = updateDto.Email;

            if (!string.IsNullOrEmpty(updateDto.Username))
                user.UserName = updateDto.Username;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded) return null;

            return new UserResponseDTO
            {
                Id = user.Id,
                Email = user.Email,
                Username = user.UserName
            };
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return false;

            var result = await _userManager.DeleteAsync(user);
            return result.Succeeded;
        }
    }
}
