using SmartClinic.Application.DTOs.Patient;
using SmartClinic.Domain.Entities;

namespace SmartClinic.Application.Interfaces;

public interface IPatientService
{
    Task<IEnumerable<PatientDto>> GetAll();
    Task<PatientDto?> GetById(int id);
    Task Add(CreatePatientDto dto);
    Task Update(int id, CreatePatientDto dto);
    Task Delete(int id);
}
