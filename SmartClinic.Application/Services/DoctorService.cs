using System.Linq.Expressions;
using AutoMapper;
using SmartClinic.Application.Common.Exceptions;
using SmartClinic.Application.Common.Pagination;
using SmartClinic.Application.DTOs.Doctor;
using SmartClinic.Application.Interfaces;
using SmartClinic.Domain.Entities;

namespace SmartClinic.Application.Services;

public class DoctorService : IDoctorService
{
    private readonly IRepository<Doctor> _repo;
    private readonly IRepository<Clinic> _clinicRepo;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUser;

    public DoctorService(
        IRepository<Doctor> repo,
        IRepository<Clinic> clinicRepo,
        IMapper mapper,
        ICurrentUserService currentUser)
    {
        _repo = repo;
        _clinicRepo = clinicRepo;
        _mapper = mapper;
        _currentUser = currentUser;
    }

    public async Task<IEnumerable<DoctorDto>> GetAll()
    {
        var doctors = await _repo.ListAsync(
            ClinicScope(),
            doctors => doctors.OrderBy(x => x.Id));

        return _mapper.Map<IEnumerable<DoctorDto>>(doctors);
    }

    public async Task<PaginatedResult<DoctorDto>> GetPagedAsync(PaginationRequest request)
    {
        var predicate = ClinicScope();

        var totalCount = await _repo.CountAsync(predicate);

        var items = await _repo.ListAsync(
            predicate,
            doctors => doctors.OrderBy(x => x.Id),
            (request.PageNumber - 1) * request.PageSize,
            request.PageSize);

        var mappedItems = _mapper.Map<List<DoctorDto>>(items);

        return new PaginatedResult<DoctorDto>
        {
            Items = mappedItems,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalCount = totalCount
        };
    }

    public async Task<DoctorDto?> GetById(int id)
    {
        var doctor = await _repo.FirstOrDefaultAsync(x =>
            x.Id == id && (_currentUser.IsAdmin || x.ClinicId == _currentUser.ClinicId));

        return doctor == null ? null : _mapper.Map<DoctorDto>(doctor);
    }

    public async Task Add(CreateDoctorDto dto)
    {
        await ValidateClinic(dto.ClinicId);

        var doctor = _mapper.Map<Doctor>(dto);
        await _repo.AddAsync(doctor);
        await _repo.SaveChangesAsync();
    }

    public async Task Update(int id, CreateDoctorDto dto)
    {
        var doctor = await _repo.GetByIdAsync(id);
        if (doctor == null || !CanAccessClinic(doctor.ClinicId))
            throw new KeyNotFoundException("Doctor not found");

        await ValidateClinic(dto.ClinicId);

        _mapper.Map(dto, doctor);
        _repo.Update(doctor);
        await _repo.SaveChangesAsync();
    }

    public async Task Delete(int id)
    {
        var doctor = await _repo.GetByIdAsync(id);
        if (doctor == null || !CanAccessClinic(doctor.ClinicId))
            throw new KeyNotFoundException("Doctor not found");

        _repo.Delete(doctor);
        await _repo.SaveChangesAsync();
    }

    private async Task ValidateClinic(int clinicId)
    {
        if (!CanAccessClinic(clinicId))
            throw new ForbiddenException("You are not allowed to access this clinic.");

        if (await _clinicRepo.GetByIdAsync(clinicId) == null)
            throw new KeyNotFoundException("Clinic not found");
    }

    private Expression<Func<Doctor, bool>>? ClinicScope()
        => _currentUser.IsAdmin
            ? null
            : doctor => doctor.ClinicId == _currentUser.ClinicId;

    private bool CanAccessClinic(int clinicId)
        => _currentUser.IsAdmin || _currentUser.ClinicId == clinicId;
}
