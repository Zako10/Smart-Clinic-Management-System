namespace SmartClinic.Domain.Entities;
using SmartClinic.Domain.Common;
using SmartClinic.Domain.Enums;

public class Invoice : BaseEntity
{
    public int AppointmentId { get; set; }

    public decimal TotalAmount { get; set; }

    public DateTime IssueDate { get; set; }

    public InvoiceStatus Status { get; set; } = InvoiceStatus.Pending;
    
    public int ClinicId { get; set; }

    public byte[] RowVersion { get; set; } = [];

    public Appointment Appointment { get; set; } = null!;

    public Clinic Clinic { get; set; } = null!;

    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
