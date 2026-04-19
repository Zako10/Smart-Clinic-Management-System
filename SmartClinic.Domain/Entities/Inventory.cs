namespace SmartClinic.Domain.Entities;
using SmartClinic.Domain.Common;

public class InventoryItem : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public int Quantity { get; set; }

    public decimal Price { get; set; }

    public DateTime ExpireDate { get; set; }

    public string SupplierName { get; set; } = string.Empty;

    public DateTime SupplierDate { get; set; }

    public int ClinicId { get; set; }

    public Clinic Clinic { get; set; } = null!;
}