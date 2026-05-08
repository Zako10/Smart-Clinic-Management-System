using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SmartClinic.API.Middleware;
using SmartClinic.API.Services;
using SmartClinic.Application.Auth.Commands;
using SmartClinic.Application.Auth.Handlers;
using SmartClinic.Application.Auth.Validation;
using SmartClinic.Application.Common.Mapping;
using SmartClinic.Application.Common.Responses;
using SmartClinic.Application.Common.Validation;
using SmartClinic.Application.Interfaces;
using SmartClinic.Application.Services;
using SmartClinic.Domain.Entities;
using SmartClinic.Infrastructure.Data;
using SmartClinic.Infrastructure.Repositories;
using SmartClinic.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("Jwt:Key is missing.");
var jwtIssuer = builder.Configuration["Jwt:Issuer"]
    ?? throw new InvalidOperationException("Jwt:Issuer is missing.");
var jwtAudience = builder.Configuration["Jwt:Audience"]
    ?? throw new InvalidOperationException("Jwt:Audience is missing.");

if (Encoding.UTF8.GetByteCount(jwtKey) < 32)
{
    throw new InvalidOperationException("Jwt:Key must be at least 32 bytes.");
}

if (builder.Environment.IsProduction() &&
    jwtKey == "YourSuperSecretKeyHereMustBe32CharsMin!")
{
    throw new InvalidOperationException("Jwt:Key must be provided by a secure production secret.");
}

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IApplicationDbTransaction, ApplicationDbTransaction>();
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IClinicService, ClinicService>();
builder.Services.AddScoped<IPatientService, PatientService>();
builder.Services.AddScoped<IAppointmentService, AppointmentService>();
builder.Services.AddScoped<IDoctorService, DoctorService>();
builder.Services.AddScoped<IInvoiceService, InvoiceService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState
                .Where(entry => entry.Value?.Errors.Count > 0)
                .ToDictionary(
                    entry => entry.Key,
                    entry => entry.Value!.Errors
                        .Select(error => string.IsNullOrWhiteSpace(error.ErrorMessage)
                            ? "Invalid value."
                            : error.ErrorMessage)
                        .ToArray());

            return new BadRequestObjectResult(new
            {
                success = false,
                message = "Validation failed",
                errors
            });
        };
    });
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddAutoMapper(_ => { }, typeof(MappingProfile).Assembly);

// Auth Services
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<ICommandValidator<RegisterCommand>, RegisterCommandValidator>();
builder.Services.AddScoped<ICommandValidator<LoginCommand>, LoginCommandValidator>();
builder.Services.AddScoped<RegisterHandler>();
builder.Services.AddScoped<LoginHandler>();

// JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.Zero,
            RoleClaimType = System.Security.Claims.ClaimTypes.Role,
            NameClaimType = System.Security.Claims.ClaimTypes.NameIdentifier
        };

        options.Events = new JwtBearerEvents
        {
            OnChallenge = async context =>
            {
                context.HandleResponse();
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                context.Response.ContentType = "application/json";

                await context.Response.WriteAsJsonAsync(
                    new ApiResponse<string>(false, "Authentication is required.", null));
            },
            OnForbidden = async context =>
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                context.Response.ContentType = "application/json";

                await context.Response.WriteAsJsonAsync(
                    new ApiResponse<string>(false, "You are not allowed to access this resource.", null));
            }
        };
    });

// Authorization policies
builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();

    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("DoctorOnly", policy => policy.RequireRole("Doctor"));
    options.AddPolicy("AdminOrDoctor", policy => policy.RequireRole("Admin", "Doctor"));
    options.AddPolicy("ReceptionistOnly", policy => policy.RequireRole("Receptionist"));
    options.AddPolicy("AdminOrReceptionist", policy => policy.RequireRole("Admin", "Receptionist"));
});

// Swagger with JWT Bearer support
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "SmartClinic API",
        Version = "v1",
        Description = "Smart Clinic Management System API"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Paste the JWT token returned from login or register."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

var seedOnStartup = bool.TryParse(app.Configuration["Database:SeedOnStartup"], out var shouldSeed)
    && shouldSeed;

if (seedOnStartup)
{
    try
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        if (!await db.Roles.AnyAsync())
        {
            await db.Roles.AddRangeAsync(
                new Role { Name = "Admin", CreatedAt = DateTime.UtcNow },
                new Role { Name = "Doctor", CreatedAt = DateTime.UtcNow },
                new Role { Name = "Receptionist", CreatedAt = DateTime.UtcNow }
            );
        }

        if (!await db.Clinics.AnyAsync())
        {
            await db.Clinics.AddAsync(new Clinic
            {
                Name = "Default Clinic",
                Address = "123 Main St",
                Phone = "555-0000",
                Email = "clinic@default.com",
                CreatedAt = DateTime.UtcNow
            });
        }

        await db.SaveChangesAsync();
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "Database seeding failed during startup.");
        throw;
    }
}

app.UseMiddleware<ExceptionMiddleware>();
app.UseMiddleware<RequestLoggingMiddleware>();
app.UseHttpsRedirection();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "SmartClinic API v1");
        options.RoutePrefix = "swagger";
    });
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

public partial class Program;
