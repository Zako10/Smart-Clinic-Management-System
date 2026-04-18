namespace SmartClinic.Domain.Entities;

public class Prescription : BaseEntity
{
    public int MedicalRecordId { get; set; }

    public string MedicationName { get; set; } = string.Empty;

    public string Dosage { get; set; } = string.Empty;

    public string Duration { get; set; } = string.Empty;

    public string Instructions { get; set; } = string.Empty;

    public MedicalRecord MedicalRecord { get; set; } = null!;
}