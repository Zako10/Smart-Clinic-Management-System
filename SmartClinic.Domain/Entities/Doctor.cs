namespace SmartClinic.Domain.Entities;
using System.ComponentModel.DataAnnotations;
using SmartClinic.Domain.Common;

public class Doctor : BaseEntity
{
    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Specialty { get; set; } = string.Empty;
    
    [MaxLength(20)]
    public string Phone { get; set; } = string.Empty;

    public int ClinicId { get; set; }

    public Clinic Clinic { get; set; } = null!;

    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    public ICollection<MedicalRecord> MedicalRecords { get; set; } = new List<MedicalRecord>();
}
