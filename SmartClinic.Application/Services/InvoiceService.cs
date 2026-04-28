using AutoMapper;
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

    public InvoiceService(
        IRepository<Invoice> repo,
        IRepository<Appointment> appointmentRepo,
        IMapper mapper)
    {
        _repo = repo;
        _appointmentRepo = appointmentRepo;
        _mapper = mapper;
    }

    public async Task<IEnumerable<InvoiceDto>> GetAll()
    {
        var invoices = await _repo.GetAllAsync();
        return _mapper.Map<IEnumerable<InvoiceDto>>(invoices);
    }

    public async Task Add(CreateInvoiceDto dto)
    {
        var appointment = await _appointmentRepo.GetByIdAsync(dto.AppointmentId);

        if (appointment == null)
            throw new KeyNotFoundException("Appointment not found");

        var existing = (await _repo.GetAllAsync())
            .Any(i => i.AppointmentId == dto.AppointmentId);

        if (existing)
            throw new InvalidOperationException("Invoice already exists");

        var invoice = new Invoice
        {
            AppointmentId = dto.AppointmentId,
            TotalAmount = dto.TotalAmount,
            Status = InvoiceStatus.Pending
        };

        await _repo.AddAsync(invoice);
        await _repo.SaveChangesAsync();
    }
}
