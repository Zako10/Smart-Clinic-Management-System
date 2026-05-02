namespace SmartClinic.Domain.Entities;
using System.ComponentModel.DataAnnotations;
using SmartClinic.Domain.Common;
using SmartClinic.Domain.Enums;

public class Appointment : BaseEntity
{
    public int PatientId { get; set; }

    public int DoctorId { get; set; }

    public DateTime DateTime { get; set; }

    public AppointmentStatus Status { get; set; } = AppointmentStatus.Scheduled;
    
    [MaxLength(250)]
    public string? Notes { get; set; }
    
    public int ClinicId { get; set; }

    public Patient Patient { get; set; } = null!;
    public Doctor Doctor { get; set; } = null!;
    public Clinic Clinic { get; set; } = null!;

    public Invoice? Invoice { get; set; }
}
