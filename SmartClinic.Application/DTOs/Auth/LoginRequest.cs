using System.ComponentModel.DataAnnotations;

namespace SmartClinic.Application.DTOs.Auth;

public class LoginRequest
{
    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}
