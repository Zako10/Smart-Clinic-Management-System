using System.ComponentModel.DataAnnotations;
using SmartClinic.Application.Auth.Commands;
using SmartClinic.Application.Common.Exceptions;
using SmartClinic.Application.Common.Validation;

namespace SmartClinic.Application.Auth.Validation;

public class LoginCommandValidator : ICommandValidator<LoginCommand>
{
    public void Validate(LoginCommand command)
    {
        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(command.Email))
            errors[nameof(command.Email)] = ["Email is required."];
        else if (!command.Email.Contains('@'))
            errors[nameof(command.Email)] = ["Email format is invalid."];

        if (string.IsNullOrWhiteSpace(command.Password))
            errors[nameof(command.Password)] = ["Password is required."];

        if (errors.Count > 0)
            throw new AppValidationException(errors);
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
