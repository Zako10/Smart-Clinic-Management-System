using SmartClinic.Application.Auth.Commands;
using SmartClinic.Application.Common.Exceptions;
using SmartClinic.Application.Common.Validation;

namespace SmartClinic.Application.Auth.Validation;

public class RegisterCommandValidator : ICommandValidator<RegisterCommand>
{
    public void Validate(RegisterCommand command)
    {
        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(command.FirstName))
            errors[nameof(command.FirstName)] = ["First name is required."];

        if (string.IsNullOrWhiteSpace(command.LastName))
            errors[nameof(command.LastName)] = ["Last name is required."];

        if (string.IsNullOrWhiteSpace(command.Email))
            errors[nameof(command.Email)] = ["Email is required."];
        else if (!command.Email.Contains('@'))
            errors[nameof(command.Email)] = ["Email format is invalid."];

        if (string.IsNullOrWhiteSpace(command.Password))
            errors[nameof(command.Password)] = ["Password is required."];
        else if (command.Password.Length < 8)
            errors[nameof(command.Password)] = ["Password must be at least 8 characters."];

        if (string.IsNullOrWhiteSpace(command.Phone))
            errors[nameof(command.Phone)] = ["Phone is required."];

        if (command.ClinicId <= 0)
            errors[nameof(command.ClinicId)] = ["ClinicId must be greater than 0."];

        if (errors.Count > 0)
            throw new AppValidationException(errors);
    }
}
