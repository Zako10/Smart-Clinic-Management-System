namespace SmartClinic.Domain.Entities;

public class User
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public int RoleId { get; set; }

    public int ClinicId { get; set; }

    public Role Role { get; set; } = null!;
    public Clinic Clinic { get; set; } = null!;
}