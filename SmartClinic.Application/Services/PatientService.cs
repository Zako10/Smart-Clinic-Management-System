using AutoMapper;
using SmartClinic.Application.Common.Pagination;
using SmartClinic.Application.DTOs.Patient;
using SmartClinic.Application.Interfaces;
using SmartClinic.Domain.Entities;

namespace SmartClinic.Application.Services;

public class PatientService : IPatientService
{
    private readonly IRepository<Patient> _repo;
    private readonly IMapper _mapper;

    public PatientService(IRepository<Patient> repo, IMapper mapper)
    {
        _repo = repo;
        _mapper = mapper;
    }

    public async Task<IEnumerable<PatientDto>> GetAll()
    {
        var patients = await _repo.GetAllAsync();
        return _mapper.Map<IEnumerable<PatientDto>>(patients);
    }

    public Task<PaginatedResult<PatientDto>> GetPagedAsync(PaginationRequest request)
    {
        var query = _repo.Query().OrderBy(x => x.Id);

        var totalCount = query.Count();

        var items = query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        var mappedItems = _mapper.Map<List<PatientDto>>(items);

        return Task.FromResult(new PaginatedResult<PatientDto>
        {
            Items = mappedItems,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalCount = totalCount
        });
    }

    public async Task Add(CreatePatientDto dto)
    {
        var patient = _mapper.Map<Patient>(dto);

        if (string.IsNullOrWhiteSpace(dto.FirstName))
            throw new Exception("First name is required");

        await _repo.AddAsync(patient);
        await _repo.SaveChangesAsync();
    }

    public async Task<PatientDto?> GetById(int id)
    {
        var patient = await _repo.GetByIdAsync(id);
        if (patient == null) return null;

        return _mapper.Map<PatientDto>(patient);
    }

    public async Task Update(int id, CreatePatientDto dto)
    {
        var patient = await _repo.GetByIdAsync(id);
        if (patient == null) return;

        _mapper.Map(dto, patient);

        _repo.Update(patient);
        await _repo.SaveChangesAsync();
    }

    public async Task Delete(int id)
    {
        var patient = await _repo.GetByIdAsync(id);
        if (patient == null) return;

        _repo.Delete(patient);
        await _repo.SaveChangesAsync();
    }
}
