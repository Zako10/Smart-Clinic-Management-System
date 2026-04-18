namespace SmartClinic.Domain.Entities;

public class Appointment : BaseEntity
{
    public int PatientId { get; set; }

    public int DoctorId { get; set; }

    public DateTime DateTime { get; set; }

    public string Status { get; set; } = "Scheduled";

    public string Notes { get; set; } = string.Empty;

    public int ClinicId { get; set; }

    public Patient Patient { get; set; } = null!;
    public Doctor Doctor { get; set; } = null!;
    public Clinic Clinic { get; set; } = null!;

    public Invoice? Invoice { get; set; }
}