using System.ComponentModel.DataAnnotations;

using SmartClinic.Domain.Enums;

namespace SmartClinic.Application.DTOs.Payment;
public class CreatePaymentDto
{
    [Required]
    public int InvoiceId { get; set; }

    [Required]
    public decimal Amount { get; set; }

    [Required]
    public PaymentMethod Method { get; set; }
}
