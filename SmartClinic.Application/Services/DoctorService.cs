using AutoMapper;
using SmartClinic.Application.DTOs.Doctor;
using SmartClinic.Application.Interfaces;
using SmartClinic.Domain.Entities;

namespace SmartClinic.Application.Services;

public class DoctorService : IDoctorService
{
    private readonly IRepository<Doctor> _repo;
    private readonly IMapper _mapper;

    public DoctorService(IRepository<Doctor> repo, IMapper mapper)
    {
        _repo = repo;
        _mapper = mapper;
    }

    public async Task<IEnumerable<DoctorDto>> GetAll()
    {
        var doctors = await _repo.GetAllAsync();
        return _mapper.Map<IEnumerable<DoctorDto>>(doctors);
    }

    public async Task<DoctorDto?> GetById(int id)
    {
        var doctor = await _repo.GetByIdAsync(id);
        if (doctor == null) return null;
        return _mapper.Map<DoctorDto>(doctor);
    }

    public async Task Add(CreateDoctorDto dto)
    {
        var doctor = _mapper.Map<Doctor>(dto);
        await _repo.AddAsync(doctor);
        await _repo.SaveChangesAsync();
    }

    public async Task Update(int id, CreateDoctorDto dto)
    {
        var doctor = await _repo.GetByIdAsync(id);
        if (doctor == null)
            throw new Exception("Doctor not found");
        _mapper.Map(dto, doctor);
        _repo.Update(doctor);
        await _repo.SaveChangesAsync();
    }

    public async Task Delete(int id)
    {
        var doctor = await _repo.GetByIdAsync(id);
        if (doctor == null)
            throw new Exception("Doctor not found");
        _repo.Delete(doctor);
        await _repo.SaveChangesAsync();
    }
}