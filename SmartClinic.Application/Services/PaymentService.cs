using AutoMapper;
using SmartClinic.Application.DTOs.Payment;
using SmartClinic.Application.Interfaces;
using SmartClinic.Domain.Entities;
using SmartClinic.Domain.Enums;

namespace SmartClinic.Application.Services;

public class PaymentService : IPaymentService
{
    private readonly IRepository<Payment> _repo;
    private readonly IRepository<Invoice> _invoiceRepo;

    public PaymentService(IRepository<Payment> repo, IRepository<Invoice> invoiceRepo)
    {
        _repo = repo;
        _invoiceRepo = invoiceRepo;
    }

    public async Task Add(CreatePaymentDto dto)
    {
        var invoice = await _invoiceRepo.GetByIdAsync(dto.InvoiceId);

        if (invoice == null)
            throw new KeyNotFoundException("Invoice not found");

        var payments = (await _repo.GetAllAsync())
            .Where(p => p.InvoiceId == dto.InvoiceId);

        var totalPaid = payments.Sum(p => p.Amount);

        var remaining = invoice.TotalAmount - totalPaid;

        if (dto.Amount <= 0)
            throw new InvalidOperationException("Invalid payment amount");

        if (remaining <= 0)
            throw new InvalidOperationException("Invoice is already paid");

        if (dto.Amount != remaining)
            throw new InvalidOperationException($"Payment amount must equal the remaining amount: {remaining}");

        var payment = new Payment
        {
            InvoiceId = dto.InvoiceId,
            Amount = dto.Amount,
            Method = dto.Method,
            PaymentDate = DateTime.UtcNow,
            Status = "Completed"
        };

        await _repo.AddAsync(payment);

        invoice.Status = InvoiceStatus.Paid;

        _invoiceRepo.Update(invoice);

        await _repo.SaveChangesAsync();
    }
}
