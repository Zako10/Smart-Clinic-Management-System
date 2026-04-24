namespace SmartClinic.Application.DTOs.Patient;


public class PatientDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
}