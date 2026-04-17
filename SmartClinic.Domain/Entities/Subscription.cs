namespace SmartClinic.Domain.Entities;

public class Subscription : BaseEntity
{
    public int ClinicId { get; set; }

    public string PlanName { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public string Status { get; set; } = "Active";

    public Clinic Clinic { get; set; } = null!;
}