using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SmartClinic.Application.Common.Exceptions;
using SmartClinic.Application.Common.Responses;

namespace SmartClinic.API.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Unhandled exception for {Method} {Path}",
                context.Request.Method,
                context.Request.Path);

            await HandleException(context, ex);
        }
    }

    private static async Task HandleException(HttpContext context, Exception ex)
    {
        context.Response.ContentType = "application/json";

        var statusCode = ex switch
        {
            AppValidationException => (int)HttpStatusCode.BadRequest,
            BadRequestException => (int)HttpStatusCode.BadRequest,
            UnauthorizedAccessException => (int)HttpStatusCode.Unauthorized,
            ForbiddenException => (int)HttpStatusCode.Forbidden,
            KeyNotFoundException => (int)HttpStatusCode.NotFound,
            ConflictException => (int)HttpStatusCode.Conflict,
            DbUpdateConcurrencyException => (int)HttpStatusCode.Conflict,
            InvalidOperationException => (int)HttpStatusCode.Conflict,
            _ => (int)HttpStatusCode.InternalServerError
        };

        context.Response.StatusCode = statusCode;

        object response = ex switch
        {
            AppValidationException validation =>
                new
                {
                    success = false,
                    message = "Validation failed",
                    errors = validation.Errors
                },
            _ when statusCode == (int)HttpStatusCode.InternalServerError =>
                new ApiResponse<string>(false, "An unexpected error occurred.", null),
            DbUpdateConcurrencyException =>
                new ApiResponse<string>(
                    false,
                    "The record was changed by another request. Reload it and try again.",
                    null),
            _ =>
                new ApiResponse<string>(false, ex.Message, null)
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}
