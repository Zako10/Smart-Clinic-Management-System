using System.Net;
using System.Text.Json;
using SmartClinic.Application.Common.Exceptions;

namespace SmartClinic.API.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IHostEnvironment _environment;

    public ExceptionMiddleware(RequestDelegate next, IHostEnvironment environment)
    {
        _next = next;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleException(context, ex, _environment);
        }
    }

    private static Task HandleException(HttpContext context, Exception ex, IHostEnvironment environment)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = ex switch
        {
            AppValidationException => (int)HttpStatusCode.BadRequest,
            ConflictException => (int)HttpStatusCode.Conflict,
            UnauthorizedAccessException => (int)HttpStatusCode.Unauthorized,
            KeyNotFoundException => (int)HttpStatusCode.NotFound,
            ArgumentException or InvalidOperationException => (int)HttpStatusCode.BadRequest,
            _ => (int)HttpStatusCode.InternalServerError
        };

        var response = new
        {
            success = false,
            message = ex.Message,
            errors = ex is AppValidationException validationException
                ? validationException.Errors
                : null,
            detail = environment.IsDevelopment() ? ex.ToString() : null
        };

        return context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}
