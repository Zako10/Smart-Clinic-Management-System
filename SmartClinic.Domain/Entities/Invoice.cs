namespace SmartClinic.Domain.Entities;

public class Invoice : BaseEntity
{
    public int AppointmentId { get; set; }

    public decimal TotalAmount { get; set; }

    public DateTime IssueDate { get; set; }

    public string Status { get; set; } = "Pending";

    public int ClinicId { get; set; }

    public Appointment Appointment { get; set; } = null!;

    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}