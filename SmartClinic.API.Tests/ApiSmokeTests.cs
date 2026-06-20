using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using SmartClinic.Application.Interfaces;
using SmartClinic.Domain.Entities;
using SmartClinic.Domain.Enums;
using SmartClinic.Infrastructure.Data;

namespace SmartClinic.API.Tests;

public class ApiSmokeTests
{
    [Fact]
    public async Task SwaggerJson_ReturnsSuccess_InDevelopment()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var response = await client.GetAsync("/swagger/v1/swagger.json");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task ProtectedEndpoint_WithoutToken_ReturnsApiResponseEnvelope()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/auth/me");
        var payload = await response.Content.ReadFromJsonAsync<ApiEnvelope>();

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.NotNull(payload);
        Assert.False(payload.Success);
        Assert.Equal("Authentication is required.", payload.Message);
    }

    [Fact]
    public async Task Register_WithInvalidBody_ReturnsValidationEnvelope()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/register", new { });
        var json = await response.Content.ReadAsStringAsync();
        using var document = JsonDocument.Parse(json);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.False(document.RootElement.GetProperty("success").GetBoolean());
        Assert.Equal("Validation failed", document.RootElement.GetProperty("message").GetString());
        Assert.True(document.RootElement.TryGetProperty("errors", out _));
    }

    [Fact]
    public async Task Auth_Register_Login_AndCurrentUser_WorkEndToEnd()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var register = await client.PostAsJsonAsync("/api/auth/register", new
        {
            firstName = "Nora",
            lastName = "Reception",
            email = "nora@example.com",
            password = "P@ssw0rd123",
            phone = "01012345678",
            clinicId = 1
        });

        Assert.Equal(HttpStatusCode.Created, register.StatusCode);
        var registerToken = await ReadTokenAsync(register);
        Assert.False(string.IsNullOrWhiteSpace(registerToken));

        var login = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "nora@example.com",
            password = "P@ssw0rd123"
        });

        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        var loginToken = await ReadTokenAsync(login);
        Assert.False(string.IsNullOrWhiteSpace(loginToken));

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", loginToken);
        var me = await client.GetAsync("/api/auth/me");
        var json = await me.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.OK, me.StatusCode);
        Assert.Contains("Receptionist", json);
    }

    [Fact]
    public async Task Admin_CanExerciseCoreClinicWorkflow()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();
        await SignInAsync(client, "admin@example.com", "Admin123!");

        var clinic = await client.PostAsJsonAsync("/api/clinic", new
        {
            name = "North Clinic",
            address = "15 Nile St",
            phone = "022222222",
            email = "north@example.com"
        });
        Assert.Equal(HttpStatusCode.Created, clinic.StatusCode);

        var patient = await client.PostAsJsonAsync("/api/patient", new
        {
            firstName = "Omar",
            lastName = "Ali",
            phone = "01000000001",
            clinicId = 1
        });
        Assert.Equal(HttpStatusCode.Created, patient.StatusCode);

        var doctor = await client.PostAsJsonAsync("/api/doctor", new
        {
            firstName = "Mona",
            lastName = "Hassan",
            specialty = "Cardiology",
            phone = "01000000002",
            clinicId = 1
        });
        Assert.Equal(HttpStatusCode.Created, doctor.StatusCode);

        var appointment = await client.PostAsJsonAsync("/api/appointment", new
        {
            dateTime = DateTime.UtcNow.AddDays(1),
            patientId = 1,
            doctorId = 1,
            clinicId = 1,
            status = AppointmentStatus.Scheduled,
            notes = "Initial visit"
        });
        Assert.Equal(HttpStatusCode.Created, appointment.StatusCode);

        var invoice = await client.PostAsJsonAsync("/api/invoice", new
        {
            appointmentId = 1,
            totalAmount = 350m
        });
        Assert.Equal(HttpStatusCode.Created, invoice.StatusCode);

        var payment = await client.PostAsJsonAsync("/api/payment", new
        {
            invoiceId = 1,
            amount = 350m,
            method = PaymentMethod.Cash
        });
        Assert.Equal(HttpStatusCode.Created, payment.StatusCode);

        await AssertSuccessfulGet(client, "/api/clinic", "Clinics retrieved successfully");
        await AssertSuccessfulGet(client, "/api/patient?pageNumber=1&pageSize=10", "Patients retrieved successfully");
        await AssertSuccessfulGet(client, "/api/doctor?pageNumber=1&pageSize=10", "Doctors retrieved successfully");
        await AssertSuccessfulGet(client, "/api/appointment?pageNumber=1&pageSize=10", "Appointment retrieved successfully");
        await AssertSuccessfulGet(client, "/api/invoice", "Invoices retrieved successfully");
    }

    [Fact]
    public async Task Receptionist_CannotUseAdminOnlyEndpoints_ButCanCreatePatients()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();
        await SignInAsync(client, "reception@example.com", "Reception123!");

        var createClinic = await client.PostAsJsonAsync("/api/clinic", new
        {
            name = "Blocked Clinic",
            address = "Any",
            phone = "01111111111",
            email = "blocked@example.com"
        });
        Assert.Equal(HttpStatusCode.Forbidden, createClinic.StatusCode);

        var createPatient = await client.PostAsJsonAsync("/api/patient", new
        {
            firstName = "Sara",
            lastName = "Samir",
            phone = "01000000003",
            clinicId = 1
        });
        Assert.Equal(HttpStatusCode.Created, createPatient.StatusCode);
    }

    private static WebApplicationFactory<Program> CreateFactory()
    {
        var databaseName = $"SmartClinicTests-{Guid.NewGuid()}";

        return new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.UseSetting("environment", "Development");
            builder.UseSetting("Database:SeedOnStartup", "false");

            builder.ConfigureServices(services =>
            {
                services.RemoveAll<DbContextOptions<ApplicationDbContext>>();
                services.RemoveAll<IApplicationDbTransaction>();

                services.AddDbContext<ApplicationDbContext>(options =>
                    options.UseInMemoryDatabase(databaseName));
                services.AddScoped<IApplicationDbTransaction, ImmediateTransaction>();

                using var provider = services.BuildServiceProvider();
                using var scope = provider.CreateScope();
                SeedDatabase(scope.ServiceProvider.GetRequiredService<ApplicationDbContext>());
            });
        });
    }

    private static void SeedDatabase(ApplicationDbContext db)
    {
        db.Database.EnsureDeleted();
        db.Database.EnsureCreated();

        db.Roles.AddRange(
            new Role { Id = 1, Name = "Admin", CreatedAt = DateTime.UtcNow },
            new Role { Id = 2, Name = "Doctor", CreatedAt = DateTime.UtcNow },
            new Role { Id = 3, Name = "Receptionist", CreatedAt = DateTime.UtcNow });

        db.Clinics.Add(new Clinic
        {
            Id = 1,
            Name = "Default Clinic",
            Address = "123 Main St",
            Phone = "555-0000",
            Email = "clinic@default.com",
            CreatedAt = DateTime.UtcNow
        });

        db.Users.AddRange(
            new User
            {
                Id = 1,
                FirstName = "Admin",
                LastName = "User",
                Email = "admin@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                Phone = "01000000000",
                Status = "Active",
                RoleId = 1,
                ClinicId = 1,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = 2,
                FirstName = "Reception",
                LastName = "User",
                Email = "reception@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Reception123!"),
                Phone = "01000000004",
                Status = "Active",
                RoleId = 3,
                ClinicId = 1,
                CreatedAt = DateTime.UtcNow
            });

        db.SaveChanges();
    }

    private static async Task SignInAsync(HttpClient client, string email, string password)
    {
        var response = await client.PostAsJsonAsync("/api/auth/login", new { email, password });
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var token = await ReadTokenAsync(response);
        Assert.False(string.IsNullOrWhiteSpace(token));
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
    }

    private static async Task<string> ReadTokenAsync(HttpResponseMessage response)
    {
        var json = await response.Content.ReadAsStringAsync();
        using var document = JsonDocument.Parse(json);
        var data = document.RootElement.GetProperty("data");
        var token = data.TryGetProperty("token", out var camelCaseToken)
            ? camelCaseToken
            : data.GetProperty("Token");

        return token.GetString() ?? string.Empty;
    }

    private static async Task AssertSuccessfulGet(HttpClient client, string url, string message)
    {
        var response = await client.GetAsync(url);
        var payload = await response.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains(message, payload);
    }

    private sealed record ApiEnvelope(bool Success, string Message);

    private sealed class ImmediateTransaction : IApplicationDbTransaction
    {
        public Task ExecuteAsync(Func<Task> operation) => operation();
    }
}
