using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace SmartClinic.API.Tests;

public class ApiSmokeTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public ApiSmokeTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseSetting("environment", "Development");
            builder.UseSetting("Database:SeedOnStartup", "false");
        });
    }

    [Fact]
    public async Task SwaggerJson_ReturnsSuccess_InDevelopment()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/swagger/v1/swagger.json");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task ProtectedEndpoint_WithoutToken_ReturnsApiResponseEnvelope()
    {
        var client = _factory.CreateClient();

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
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/register", new { });
        var json = await response.Content.ReadAsStringAsync();
        using var document = JsonDocument.Parse(json);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.False(document.RootElement.GetProperty("success").GetBoolean());
        Assert.Equal("Validation failed", document.RootElement.GetProperty("message").GetString());
        Assert.True(document.RootElement.TryGetProperty("errors", out _));
    }

    private sealed record ApiEnvelope(bool Success, string Message);
}
