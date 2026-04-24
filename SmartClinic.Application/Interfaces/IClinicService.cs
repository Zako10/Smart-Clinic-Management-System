using SmartClinic.Application.DTOs.Clinic;

namespace SmartClinic.Application.Interfaces;

public interface IClinicService
{
    Task<IEnumerable<ClinicDto>> GetAll();
    Task<ClinicDto?> GetById(int id);
    Task Add(CreateClinicDto dto);
    Task Update(int id, CreateClinicDto dto);
    Task Delete(int id);
}
