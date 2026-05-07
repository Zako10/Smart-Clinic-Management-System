using SmartClinic.Application.Common.Pagination;
using SmartClinic.Application.DTOs.Appointment;

namespace SmartClinic.Application.Interfaces;

public interface IAppointmentService
{
    Task<IEnumerable<AppointmentDto>> GetAll();
    Task<PaginatedResult<AppointmentDto>> GetPagedAsync(PaginationRequest request);
    Task<AppointmentDto?> GetById(int id);
    Task Add(CreateAppointmentDto dto);
    Task Update(int id, CreateAppointmentDto dto);
    Task Delete(int id);
}
