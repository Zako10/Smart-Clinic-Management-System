namespace SmartClinic.Domain.Entities;

public class Subscription
{
    public int Id { get; set; }

    public string PlanName { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public ICollection<Clinic> Clinics { get; set; } = new List<Clinic>();
}