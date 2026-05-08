using System.ComponentModel.DataAnnotations;

using SmartClinic.Domain.Enums;

namespace SmartClinic.Application.DTOs.Payment;
public class CreatePaymentDto
{
    [Range(1, int.MaxValue)]
    public int InvoiceId { get; set; }

    [Range(typeof(decimal), "0.01", "79228162514264337593543950335")]
    public decimal Amount { get; set; }

    [EnumDataType(typeof(PaymentMethod))]
    public PaymentMethod Method { get; set; }
}
