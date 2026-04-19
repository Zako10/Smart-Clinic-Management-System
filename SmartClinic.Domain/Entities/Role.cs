namespace SmartClinic.Domain.Entities;
using SmartClinic.Domain.Common;

public class Role : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public ICollection<User> Users { get; set; } = new List<User>();
}