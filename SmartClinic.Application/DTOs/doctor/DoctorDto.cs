namespace SmartClinic.Application.DTOs.Doctor;

public class DoctorDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Specialty { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public int ClinicId { get; set; }
}