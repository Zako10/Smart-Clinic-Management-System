using System.Linq.Expressions;
using AutoMapper;
using SmartClinic.Application.Common.Exceptions;
using SmartClinic.Application.Common.Pagination;
using SmartClinic.Application.DTOs.Patient;
using SmartClinic.Application.Interfaces;
using SmartClinic.Domain.Entities;

namespace SmartClinic.Application.Services;

public class PatientService : IPatientService
{
    private readonly IRepository<Patient> _repo;
    private readonly IRepository<Clinic> _clinicRepo;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUser;

    public PatientService(
        IRepository<Patient> repo,
        IRepository<Clinic> clinicRepo,
        IMapper mapper,
        ICurrentUserService currentUser)
    {
        _repo = repo;
        _clinicRepo = clinicRepo;
        _mapper = mapper;
        _currentUser = currentUser;
    }

    public async Task<IEnumerable<PatientDto>> GetAll()
    {
        var patients = await _repo.ListAsync(
            ClinicScope(),
            patients => patients.OrderBy(x => x.Id));

        return _mapper.Map<IEnumerable<PatientDto>>(patients);
    }

    public async Task<PaginatedResult<PatientDto>> GetPagedAsync(PaginationRequest request)
    {
        var predicate = ClinicScope();

        var totalCount = await _repo.CountAsync(predicate);

        var items = await _repo.ListAsync(
            predicate,
            patients => patients.OrderBy(x => x.Id),
            (request.PageNumber - 1) * request.PageSize,
            request.PageSize);

        var mappedItems = _mapper.Map<List<PatientDto>>(items);

        return new PaginatedResult<PatientDto>
        {
            Items = mappedItems,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalCount = totalCount
        };
    }

    public async Task Add(CreatePatientDto dto)
    {
        await ValidateClinic(dto.ClinicId);

        var patient = _mapper.Map<Patient>(dto);
        await _repo.AddAsync(patient);
        await _repo.SaveChangesAsync();
    }

    public async Task<PatientDto?> GetById(int id)
    {
        var patient = await _repo.FirstOrDefaultAsync(x =>
            x.Id == id && (_currentUser.IsAdmin || x.ClinicId == _currentUser.ClinicId));

        return patient == null ? null : _mapper.Map<PatientDto>(patient);
    }

    public async Task Update(int id, CreatePatientDto dto)
    {
        var patient = await _repo.GetByIdAsync(id);
        if (patient == null || !CanAccessClinic(patient.ClinicId))
            throw new KeyNotFoundException("Patient not found");

        await ValidateClinic(dto.ClinicId);

        _mapper.Map(dto, patient);
        _repo.Update(patient);
        await _repo.SaveChangesAsync();
    }

    public async Task Delete(int id)
    {
        var patient = await _repo.GetByIdAsync(id);
        if (patient == null || !CanAccessClinic(patient.ClinicId))
            throw new KeyNotFoundException("Patient not found");

        _repo.Delete(patient);
        await _repo.SaveChangesAsync();
    }

    private async Task ValidateClinic(int clinicId)
    {
        if (!CanAccessClinic(clinicId))
            throw new ForbiddenException("You are not allowed to access this clinic.");

        if (await _clinicRepo.GetByIdAsync(clinicId) == null)
            throw new KeyNotFoundException("Clinic not found");
    }

    private Expression<Func<Patient, bool>>? ClinicScope()
        => _currentUser.IsAdmin
            ? null
            : patient => patient.ClinicId == _currentUser.ClinicId;

    private bool CanAccessClinic(int clinicId)
        => _currentUser.IsAdmin || _currentUser.ClinicId == clinicId;
}
