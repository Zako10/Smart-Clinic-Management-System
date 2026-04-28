using System.ComponentModel.DataAnnotations;
namespace SmartClinic.Application.DTOs.Invoice;

public class CreateInvoiceDto
{
    [Required]
    public int AppointmentId { get; set; }

    [Required]
    public decimal TotalAmount { get; set; }
}