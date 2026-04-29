using System.ComponentModel.DataAnnotations;

using SmartClinic.Domain.Enums;

namespace SmartClinic.Application.DTOs.Appointment;

public class CreateAppointmentDto
{
    [Required]
    public DateTime DateTime { get; set; }
    [Required]
    public int PatientId { get; set; }
    [Required]
    public int DoctorId { get; set; }
    [Required]
    
    public int ClinicId { get; set; }
    public AppointmentStatus Status { get; set; } = AppointmentStatus.Scheduled;
    public string Notes { get; set; } = string.Empty;
}
