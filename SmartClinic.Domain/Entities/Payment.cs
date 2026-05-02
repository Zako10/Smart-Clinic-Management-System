namespace SmartClinic.Domain.Entities;
using SmartClinic.Domain.Common;
using SmartClinic.Domain.Enums;

public class Payment : BaseEntity
{
    public int InvoiceId { get; set; }

    public decimal Amount { get; set; }

    public DateTime PaymentDate { get; set; }

    public PaymentMethod Method { get; set; }

    public string Status { get; set; } = "Completed";
    
    public Invoice Invoice { get; set; } = null!;
}
