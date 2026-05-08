using System.Linq.Expressions;
using AutoMapper;
using Microsoft.Extensions.Logging;
using SmartClinic.Application.Common.Exceptions;
using SmartClinic.Application.DTOs.Invoice;
using SmartClinic.Application.Interfaces;
using SmartClinic.Domain.Entities;
using SmartClinic.Domain.Enums;

namespace SmartClinic.Application.Services;

public class InvoiceService : IInvoiceService
{
    private readonly IRepository<Invoice> _repo;
    private readonly IRepository<Appointment> _appointmentRepo;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUser;
    private readonly ILogger<InvoiceService> _logger;

    public InvoiceService(
        IRepository<Invoice> repo,
        IRepository<Appointment> appointmentRepo,
        IMapper mapper,
        ICurrentUserService currentUser,
        ILogger<InvoiceService> logger)
    {
        _repo = repo;
        _appointmentRepo = appointmentRepo;
        _mapper = mapper;
        _currentUser = currentUser;
        _logger = logger;
    }

    public async Task<IEnumerable<InvoiceDto>> GetAll()
    {
        var invoices = await _repo.ListAsync(
            ClinicScope(),
            invoices => invoices.OrderBy(x => x.Id));

        return _mapper.Map<IEnumerable<InvoiceDto>>(invoices);
    }

    public async Task<InvoiceDto?> GetById(int id)
    {
        var invoice = await _repo.FirstOrDefaultAsync(x =>
            x.Id == id && (_currentUser.IsAdmin || x.ClinicId == _currentUser.ClinicId));

        return invoice == null ? null : _mapper.Map<InvoiceDto>(invoice);
    }

    public async Task Add(CreateInvoiceDto dto)
    {
        var appointment = await _appointmentRepo.GetByIdAsync(dto.AppointmentId);

        if (appointment == null || !CanAccessClinic(appointment.ClinicId))
            throw new KeyNotFoundException("Appointment not found");

        var existing = await _repo.AnyAsync(i =>
            i.AppointmentId == dto.AppointmentId
            && (_currentUser.IsAdmin || i.ClinicId == _currentUser.ClinicId));

        if (existing)
            throw new ConflictException("Invoice already exists.");

        var invoice = new Invoice
        {
            AppointmentId = dto.AppointmentId,
            TotalAmount = dto.TotalAmount,
            IssueDate = DateTime.UtcNow,
            Status = InvoiceStatus.Pending,
            ClinicId = appointment.ClinicId
        };

        await _repo.AddAsync(invoice);
        await _repo.SaveChangesAsync();

        _logger.LogInformation(
            "Invoice {InvoiceId} created for appointment {AppointmentId} in clinic {ClinicId} with total {TotalAmount}.",
            invoice.Id,
            invoice.AppointmentId,
            invoice.ClinicId,
            invoice.TotalAmount);
    }

    public async Task Update(int id, CreateInvoiceDto dto)
    {
        var invoice = await _repo.GetByIdAsync(id);
        if (invoice == null || !CanAccessClinic(invoice.ClinicId))
            throw new KeyNotFoundException("Invoice not found");

        var appointment = await _appointmentRepo.GetByIdAsync(dto.AppointmentId);
        if (appointment == null || !CanAccessClinic(appointment.ClinicId))
            throw new KeyNotFoundException("Appointment not found");

        invoice.AppointmentId = dto.AppointmentId;
        invoice.TotalAmount = dto.TotalAmount;
        invoice.ClinicId = appointment.ClinicId;

        _repo.Update(invoice);
        await _repo.SaveChangesAsync();
    }

    public async Task Delete(int id)
    {
        var invoice = await _repo.GetByIdAsync(id);
        if (invoice == null || !CanAccessClinic(invoice.ClinicId))
            throw new KeyNotFoundException("Invoice not found");

        _repo.Delete(invoice);
        await _repo.SaveChangesAsync();
    }

    private Expression<Func<Invoice, bool>>? ClinicScope()
        => _currentUser.IsAdmin
            ? null
            : invoice => invoice.ClinicId == _currentUser.ClinicId;

    private bool CanAccessClinic(int clinicId)
        => _currentUser.IsAdmin || _currentUser.ClinicId == clinicId;
}
