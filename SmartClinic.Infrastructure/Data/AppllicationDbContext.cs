using Microsoft.EntityFrameworkCore;
using SmartClinic.Domain.Entities;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    public DbSet<Clinic> Clinics => Set<Clinic>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Patient> Patients => Set<Patient>();
    public DbSet<Doctor> Doctors => Set<Doctor>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<MedicalRecord> MedicalRecords => Set<MedicalRecord>();
    public DbSet<Prescription> Prescriptions => Set<Prescription>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<InventoryItem> InventoryItems => Set<InventoryItem>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();
}

protected override void OnModelCreating(ModelBuilder builder)
{
    base.OnModelCreating(builder);
}

builder.Entity<User>()
    .HasOne(u => u.Clinic)
    .WithMany(c => c.Users)
    .HasForeignKey(u => u.ClinicId);

builder.Entity<User>()
    .HasOne(u => u.Role)
    .WithMany(r => r.Users)
    .HasForeignKey(u => u.RoleId);

