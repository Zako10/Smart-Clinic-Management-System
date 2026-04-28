using AutoMapper;
using SmartClinic.Application.DTOs.Appointment;
using SmartClinic.Application.Interfaces;
using SmartClinic.Domain.Entities;

namespace SmartClinic.Application.Services;

public class AppointmentService : IAppointmentService
{
    private readonly IRepository<Appointment> _repo;
    private readonly IMapper _mapper;

    public AppointmentService(IRepository<Appointment> repo, IMapper mapper)
    {
        _repo = repo;
        _mapper = mapper;
    }

    public async Task<IEnumerable<AppointmentDto>> GetAll()
    {
        var appointments = await _repo.GetAllAsync();
        return _mapper.Map<IEnumerable<AppointmentDto>>(appointments);
    }

    public async Task<AppointmentDto?> GetById(int id)
    {
        var appointment = await _repo.GetByIdAsync(id);
        if (appointment == null) return null;
        return _mapper.Map<AppointmentDto>(appointment);
    }

    public async Task Add(CreateAppointmentDto dto)
    {
        var appointment = _mapper.Map<Appointment>(dto);
        await _repo.AddAsync(appointment);
        await _repo.SaveChangesAsync();
    }

    public async Task Update(int id, CreateAppointmentDto dto)
    {
        var appointment = await _repo.GetByIdAsync(id);
        if (appointment == null)
            throw new KeyNotFoundException("Appointment not found");
        _mapper.Map(dto, appointment);
        _repo.Update(appointment);
        await _repo.SaveChangesAsync();
    }

    public async Task Delete(int id)
    {
        var appointment = await _repo.GetByIdAsync(id);
        if (appointment == null)
            throw new KeyNotFoundException("Appointment not found");
        _repo.Delete(appointment);
        await _repo.SaveChangesAsync();
    }
}