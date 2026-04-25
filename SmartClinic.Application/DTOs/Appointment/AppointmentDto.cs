namespace SmartClinic.Application.DTOs.Appointment;

public class AppointmentDto
{
    public int Id { get; set; }
    public DateTime DateTime { get; set; }
    public int PatientId { get; set; }
    public int DoctorId { get; set; }
    public int ClinicId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
}