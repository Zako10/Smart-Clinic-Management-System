using System.ComponentModel.DataAnnotations;
namespace SmartClinic.Application.DTOs.Invoice;

public class CreateInvoiceDto
{
    [Range(1, int.MaxValue)]
    public int AppointmentId { get; set; }

    [Range(typeof(decimal), "0.01", "79228162514264337593543950335")]
    public decimal TotalAmount { get; set; }
}
