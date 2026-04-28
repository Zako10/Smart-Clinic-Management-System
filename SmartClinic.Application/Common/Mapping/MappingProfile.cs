using AutoMapper;
using SmartClinic.Application.DTOs.Appointment;
using SmartClinic.Application.DTOs.Clinic;
using SmartClinic.Application.DTOs.Doctor;
using SmartClinic.Application.DTOs.Invoice;
using SmartClinic.Application.DTOs.Patient;
using SmartClinic.Application.DTOs.Payment;
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

        CreateMap<Appointment, AppointmentDto>();
        CreateMap<CreateAppointmentDto, Appointment>();

        CreateMap<Doctor, DoctorDto>();
        CreateMap<CreateDoctorDto, Doctor>();

        CreateMap<Invoice, InvoiceDto>();
        CreateMap<CreateInvoiceDto, Invoice>();

        CreateMap<Payment, PaymentDto>();
        CreateMap<CreatePaymentDto, Payment>();
        
    }
}
