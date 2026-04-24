using AutoMapper;
using SmartClinic.Application.DTOs.Patient;
using SmartClinic.Application.DTOs.Clinic;
using SmartClinic.Domain.Entities;

namespace SmartClinic.Application.Common.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {

        CreateMap<Patient, PatientDto>()
            .ForMember(dest => dest.FullName,
                opt => opt.MapFrom(src => src.FirstName + " " + src.LastName));

        CreateMap<CreatePatientDto, Patient>();



        CreateMap<Clinic, ClinicDto>();
        CreateMap<CreateClinicDto, Clinic>();

    }
}