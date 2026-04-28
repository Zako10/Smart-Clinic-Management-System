namespace SmartClinic.Application.DTOs.Payment;

public class PaymentDto
{
    public int Id { get; set; }
    public int InvoiceId { get; set; }
    public decimal Amount { get; set; }
}