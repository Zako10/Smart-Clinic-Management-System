using System.ComponentModel.DataAnnotations;

namespace SmartClinic.Application.DTOs.Doctor;

public class CreateDoctorDto
{
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Specialty { get; set; } = string.Empty;

    [Required]
    [Phone]
    [MaxLength(20)]
    public string Phone { get; set; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int ClinicId { get; set; }
}
