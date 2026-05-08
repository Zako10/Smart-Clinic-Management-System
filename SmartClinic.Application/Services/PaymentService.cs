using Microsoft.Extensions.Logging;
using SmartClinic.Application.Common.Exceptions;
using SmartClinic.Application.DTOs.Payment;
using SmartClinic.Application.Interfaces;
using SmartClinic.Domain.Entities;
using SmartClinic.Domain.Enums;

namespace SmartClinic.Application.Services;

public class PaymentService : IPaymentService
{
    private readonly IRepository<Payment> _repo;
    private readonly IRepository<Invoice> _invoiceRepo;
    private readonly ICurrentUserService _currentUser;
    private readonly IApplicationDbTransaction _transaction;
    private readonly ILogger<PaymentService> _logger;

    public PaymentService(
        IRepository<Payment> repo,
        IRepository<Invoice> invoiceRepo,
        ICurrentUserService currentUser,
        IApplicationDbTransaction transaction,
        ILogger<PaymentService> logger)
    {
        _repo = repo;
        _invoiceRepo = invoiceRepo;
        _currentUser = currentUser;
        _transaction = transaction;
        _logger = logger;
    }

    public async Task Add(CreatePaymentDto dto)
        => await _transaction.ExecuteAsync(async () =>
        {
            var invoice = await _invoiceRepo.GetByIdAsync(dto.InvoiceId);

            if (invoice == null || !CanAccessClinic(invoice.ClinicId))
                throw new KeyNotFoundException("Invoice not found");

            var payments = await _repo.ListAsync(p => p.InvoiceId == dto.InvoiceId);

            var totalPaid = payments.Sum(p => p.Amount);
            var remaining = invoice.TotalAmount - totalPaid;

            if (remaining <= 0 || invoice.Status == InvoiceStatus.Paid)
                throw new ConflictException("Invoice is already paid.");

            if (dto.Amount > remaining)
                throw new BadRequestException($"Payment amount cannot exceed the remaining amount: {remaining}.");

            var payment = new Payment
            {
                InvoiceId = dto.InvoiceId,
                Amount = dto.Amount,
                Method = dto.Method,
                PaymentDate = DateTime.UtcNow,
                Status = "Completed"
            };

            await _repo.AddAsync(payment);

            var newTotalPaid = totalPaid + dto.Amount;
            invoice.Status = newTotalPaid >= invoice.TotalAmount
                ? InvoiceStatus.Paid
                : InvoiceStatus.Partial;

            _invoiceRepo.Update(invoice);

            await _repo.SaveChangesAsync();

            _logger.LogInformation(
                "Payment {PaymentId} posted to invoice {InvoiceId} in clinic {ClinicId}. Amount: {Amount}. Invoice status: {InvoiceStatus}.",
                payment.Id,
                invoice.Id,
                invoice.ClinicId,
                payment.Amount,
                invoice.Status);
        });

    private bool CanAccessClinic(int clinicId)
        => _currentUser.IsAdmin || _currentUser.ClinicId == clinicId;
}
