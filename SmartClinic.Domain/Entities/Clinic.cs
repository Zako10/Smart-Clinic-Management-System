namespace SmartClinic.Domain.Entities;

public class Clinic
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public int? SubscriptionId { get; set; }

    public Subscription? Subscription { get; set; }

    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<Patient> Patients { get; set; } = new List<Patient>();
    public ICollection<Doctor> Doctors { get; set; } = new List<Doctor>();
}