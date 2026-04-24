using System.ComponentModel.DataAnnotations;

namespace SmartClinic.Application.DTOs.Clinic;

public class CreateClinicDto
{
    [Required]
    public string Name { get; set; } = string.Empty;
}