using System.Linq.Expressions;
using AutoMapper;
using Microsoft.Extensions.Logging;
using SmartClinic.Application.Common.Exceptions;
using SmartClinic.Application.Common.Pagination;
using SmartClinic.Application.DTOs.Appointment;
using SmartClinic.Application.Interfaces;
using SmartClinic.Domain.Entities;

namespace SmartClinic.Application.Services;

public class AppointmentService : IAppointmentService
{
    private readonly IRepository<Appointment> _repo;
    private readonly IRepository<Patient> _patientRepo;
    private readonly IRepository<Doctor> _doctorRepo;
    private readonly IRepository<Clinic> _clinicRepo;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUser;
    private readonly ILogger<AppointmentService> _logger;

    public AppointmentService(
        IRepository<Appointment> repo,
        IRepository<Patient> patientRepo,
        IRepository<Doctor> doctorRepo,
        IRepository<Clinic> clinicRepo,
        IMapper mapper,
        ICurrentUserService currentUser,
        ILogger<AppointmentService> logger)
    {
        _repo = repo;
        _patientRepo = patientRepo;
        _doctorRepo = doctorRepo;
        _clinicRepo = clinicRepo;
        _mapper = mapper;
        _currentUser = currentUser;
        _logger = logger;
    }

    public async Task<IEnumerable<AppointmentDto>> GetAll()
    {
        var appointments = await _repo.ListAsync(
            ClinicScope(),
            appointments => appointments.OrderBy(x => x.Id));

        return _mapper.Map<IEnumerable<AppointmentDto>>(appointments);
    }

    public async Task<PaginatedResult<AppointmentDto>> GetPagedAsync(PaginationRequest request)
    {
        var predicate = ClinicScope();

        var totalCount = await _repo.CountAsync(predicate);

        var items = await _repo.ListAsync(
            predicate,
            appointments => appointments.OrderBy(x => x.Id),
            (request.PageNumber - 1) * request.PageSize,
            request.PageSize);

        var mappedItems = _mapper.Map<List<AppointmentDto>>(items);

        return new PaginatedResult<AppointmentDto>
        {
            Items = mappedItems,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalCount = totalCount
        };
    }

    public async Task<AppointmentDto?> GetById(int id)
    {
        var appointment = await _repo.FirstOrDefaultAsync(x =>
            x.Id == id && (_currentUser.IsAdmin || x.ClinicId == _currentUser.ClinicId));

        return appointment == null ? null : _mapper.Map<AppointmentDto>(appointment);
    }

    public async Task Add(CreateAppointmentDto dto)
    {
        await ValidateAppointmentReferences(dto);

        var appointment = _mapper.Map<Appointment>(dto);
        await _repo.AddAsync(appointment);
        await _repo.SaveChangesAsync();

        _logger.LogInformation(
            "Appointment {AppointmentId} created for patient {PatientId}, doctor {DoctorId}, clinic {ClinicId} at {AppointmentDateTime}.",
            appointment.Id,
            appointment.PatientId,
            appointment.DoctorId,
            appointment.ClinicId,
            appointment.DateTime);
    }

    public async Task Update(int id, CreateAppointmentDto dto)
    {
        var appointment = await _repo.GetByIdAsync(id);
        if (appointment == null || !CanAccessClinic(appointment.ClinicId))
            throw new KeyNotFoundException("Appointment not found");

        await ValidateAppointmentReferences(dto);

        _mapper.Map(dto, appointment);
        _repo.Update(appointment);
        await _repo.SaveChangesAsync();
    }

    public async Task Delete(int id)
    {
        var appointment = await _repo.GetByIdAsync(id);
        if (appointment == null || !CanAccessClinic(appointment.ClinicId))
            throw new KeyNotFoundException("Appointment not found");

        _repo.Delete(appointment);
        await _repo.SaveChangesAsync();
    }

    private async Task ValidateAppointmentReferences(CreateAppointmentDto dto)
    {
        EnsureClinicAccess(dto.ClinicId);

        if (dto.DateTime == default)
            throw new BadRequestException("Appointment date/time is required.");

        var clinic = await _clinicRepo.GetByIdAsync(dto.ClinicId);
        if (clinic == null)
            throw new KeyNotFoundException("Clinic not found");

        var patient = await _patientRepo.GetByIdAsync(dto.PatientId);
        if (patient == null)
            throw new KeyNotFoundException("Patient not found");

        var doctor = await _doctorRepo.GetByIdAsync(dto.DoctorId);
        if (doctor == null)
            throw new KeyNotFoundException("Doctor not found");

        if (patient.ClinicId != dto.ClinicId || doctor.ClinicId != dto.ClinicId)
            throw new BadRequestException("Patient, doctor, and appointment must belong to the same clinic.");
    }

    private Expression<Func<Appointment, bool>>? ClinicScope()
        => _currentUser.IsAdmin
            ? null
            : appointment => appointment.ClinicId == _currentUser.ClinicId;

    private void EnsureClinicAccess(int clinicId)
    {
        if (!CanAccessClinic(clinicId))
            throw new ForbiddenException("You are not allowed to access this clinic.");
    }

    private bool CanAccessClinic(int clinicId)
        => _currentUser.IsAdmin || _currentUser.ClinicId == clinicId;
}
