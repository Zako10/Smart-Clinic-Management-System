using System.ComponentModel.DataAnnotations;

namespace SmartClinic.Application.DTOs.Clinic;

public class ClinicDto
{
    public int Id { get; set; }

    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;
}
