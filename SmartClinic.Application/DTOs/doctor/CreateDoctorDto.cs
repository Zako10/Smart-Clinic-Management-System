using System.ComponentModel.DataAnnotations;

namespace SmartClinic.Application.DTOs.Doctor;

public class CreateDoctorDto
{
    [Required]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    public string LastName { get; set; } = string.Empty;

    [Required]
    public string Specialty { get; set; } = string.Empty;

    [Required]
    public string Phone { get; set; } = string.Empty;

    [Required]
    public int ClinicId { get; set; }
}