using System.ComponentModel.DataAnnotations;
using SmartClinic.Application.Auth.Commands;
using SmartClinic.Application.Common.Exceptions;
using SmartClinic.Application.Common.Validation;

namespace SmartClinic.Application.Auth.Validation;

public class RegisterCommandValidator : ICommandValidator<RegisterCommand>
{
    public void Validate(RegisterCommand command)
    {
        var errors = new Dictionary<string, List<string>>();

        if (command is null)
        {
            Add(errors, "Request", "Request body is required.");
            ThrowIfInvalid(errors);
            return;
        }

        AddRequired(errors, nameof(command.FirstName), command.FirstName);
        AddRequired(errors, nameof(command.LastName), command.LastName);
        AddRequired(errors, nameof(command.Email), command.Email);
        AddRequired(errors, nameof(command.Password), command.Password);
        AddRequired(errors, nameof(command.Phone), command.Phone);

        if (!string.IsNullOrWhiteSpace(command.Email) &&
            !new EmailAddressAttribute().IsValid(command.Email))
        {
            Add(errors, nameof(command.Email), "Email must be a valid email address.");
        }

        if (!string.IsNullOrEmpty(command.Password) && command.Password.Length < 8)
        {
            Add(errors, nameof(command.Password), "Password must be at least 8 characters.");
        }

        if (command.RoleId <= 0)
        {
            Add(errors, nameof(command.RoleId), "RoleId must be greater than zero.");
        }

        if (command.ClinicId <= 0)
        {
            Add(errors, nameof(command.ClinicId), "ClinicId must be greater than zero.");
        }

        ThrowIfInvalid(errors);
    }

    private static void AddRequired(Dictionary<string, List<string>> errors, string field, string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            Add(errors, field, $"{field} is required.");
        }
    }

    private static void Add(Dictionary<string, List<string>> errors, string field, string error)
    {
        if (!errors.TryGetValue(field, out var fieldErrors))
        {
            fieldErrors = [];
            errors[field] = fieldErrors;
        }

        fieldErrors.Add(error);
    }

    private static void ThrowIfInvalid(Dictionary<string, List<string>> errors)
    {
        if (errors.Count == 0)
        {
            return;
        }

        throw new AppValidationException(
            errors.ToDictionary(error => error.Key, error => error.Value.ToArray()));
    }
}
