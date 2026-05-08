using System.ComponentModel.DataAnnotations;

using SmartClinic.Domain.Enums;

namespace SmartClinic.Application.DTOs.Appointment;

public class CreateAppointmentDto
{
    [Required]
    public DateTime DateTime { get; set; }

    [Range(1, int.MaxValue)]
    public int PatientId { get; set; }

    [Range(1, int.MaxValue)]
    public int DoctorId { get; set; }

    [Range(1, int.MaxValue)]
    public int ClinicId { get; set; }

    [EnumDataType(typeof(AppointmentStatus))]
    public AppointmentStatus Status { get; set; } = AppointmentStatus.Scheduled;

    [MaxLength(250)]
    public string Notes { get; set; } = string.Empty;
}
