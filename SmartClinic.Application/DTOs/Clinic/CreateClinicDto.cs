using System.ComponentModel.DataAnnotations;

namespace SmartClinic.Application.DTOs.Clinic;

public class CreateClinicDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
}
