using SmartClinic.Application.Common.Pagination;
using SmartClinic.Application.DTOs.Doctor;

namespace SmartClinic.Application.Interfaces;

public interface IDoctorService
{
    Task<IEnumerable<DoctorDto>> GetAll();
    Task<PaginatedResult<DoctorDto>> GetPagedAsync(PaginationRequest request);
    Task<DoctorDto?> GetById(int id);
    Task Add(CreateDoctorDto dto);
    Task Update(int id, CreateDoctorDto dto);
    Task Delete(int id);
}
