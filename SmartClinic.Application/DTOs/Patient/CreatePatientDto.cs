using System.ComponentModel.DataAnnotations;
namespace SmartClinic.Application.DTOs.Patient;

public class CreatePatientDto
{
    [Required]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    public string LastName { get; set; } = string.Empty;

    [Phone]
    public string Phone { get; set; } = string.Empty;

    public int ClinicId { get; set; }
    
}