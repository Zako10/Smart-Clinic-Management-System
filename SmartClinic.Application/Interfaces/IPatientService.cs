using SmartClinic.Application.Common.Pagination;
using SmartClinic.Application.DTOs.Patient;

namespace SmartClinic.Application.Interfaces;

public interface IPatientService
{
    Task<IEnumerable<PatientDto>> GetAll();
    Task<PaginatedResult<PatientDto>> GetPagedAsync(PaginationRequest request);
    Task<PatientDto?> GetById(int id);
    Task Add(CreatePatientDto dto);
    Task Update(int id, CreatePatientDto dto);
    Task Delete(int id);
}
