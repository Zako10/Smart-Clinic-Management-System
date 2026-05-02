using System.ComponentModel.DataAnnotations;

namespace SmartClinic.Application.DTOs.Clinic;

public class ClinicDto
{
    public int Id { get; set; }
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
}
