namespace SmartClinic.Domain.Entities;
using SmartClinic.Domain.Common;

public class Payment : BaseEntity
{
    public int InvoiceId { get; set; }

    public decimal Amount { get; set; }

    public DateTime PaymentDate { get; set; }

    public string Method { get; set; } = string.Empty;

    public string Status { get; set; } = "Completed";

    public Invoice Invoice { get; set; } = null!;
}