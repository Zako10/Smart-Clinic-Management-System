namespace SmartClinic.Application.DTOs.Invoice;

public class InvoiceDto
{
    public int Id { get; set; }
    public int AppointmentId { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
}