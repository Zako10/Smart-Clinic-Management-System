namespace SmartClinic.Domain.Entities;

public class User : BaseEntity
{
    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public string Status { get; set; } = "Active";

    public int RoleId { get; set; }

    public int ClinicId { get; set; }

    public Role Role { get; set; } = null!;
    public Clinic Clinic { get; set; } = null!;
}