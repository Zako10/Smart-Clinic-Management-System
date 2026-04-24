using AutoMapper;
using SmartClinic.Application.DTOs.Clinic;
using SmartClinic.Application.Interfaces;
using SmartClinic.Domain.Entities;

namespace SmartClinic.Application.Services;

public class ClinicService : IClinicService
{
    private readonly IRepository<Clinic> _repo;
    private readonly IMapper _mapper;

    public ClinicService(IRepository<Clinic> repo, IMapper mapper)
    {
        _repo = repo;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ClinicDto>> GetAll()
    {
        var clinics = await _repo.GetAllAsync();
        return _mapper.Map<IEnumerable<ClinicDto>>(clinics);
    }

    public async Task Add(CreateClinicDto dto)
    {
        var clinic = _mapper.Map<Clinic>(dto);

        await _repo.AddAsync(clinic);
        await _repo.SaveChangesAsync();
    }

    public async Task<ClinicDto?> GetById(int id)
    {
        var clinic = await _repo.GetByIdAsync(id);

        if (clinic == null)
            return null;

        return _mapper.Map<ClinicDto>(clinic);
    }

    public async Task Update(int id, CreateClinicDto dto)
    {
        var clinic = await _repo.GetByIdAsync(id);

        if (clinic == null)
            throw new Exception("Clinic not found");

        _mapper.Map(dto, clinic);

        _repo.Update(clinic);
        await _repo.SaveChangesAsync();
    }
    public async Task Delete(int id)
    {
        var clinic = await _repo.GetByIdAsync(id);

        if (clinic == null)
            throw new Exception("Clinic not found");

        _repo.Delete(clinic);
        await _repo.SaveChangesAsync();
    }
}