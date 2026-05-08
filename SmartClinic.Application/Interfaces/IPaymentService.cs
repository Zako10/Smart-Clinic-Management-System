using SmartClinic.Application.DTOs.Payment;

namespace SmartClinic.Application.Interfaces;

public interface IPaymentService
{
    Task Add(CreatePaymentDto dto);
}
