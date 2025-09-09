using AutoMapper;
using ElectronicsPriceTracker.Application.DTOs;
using ElectronicsPriceTracker.Domain.Entities;

namespace ElectronicsPriceTracker.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Product, ProductResponseDto>()
            .ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.Category));
    }
}