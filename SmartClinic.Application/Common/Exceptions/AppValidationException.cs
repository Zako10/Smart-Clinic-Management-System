namespace SmartClinic.Application.Common.Exceptions;

public class AppValidationException : Exception
{
    public AppValidationException(IDictionary<string, string[]> errors)
        : base("Validation failed.")
    {
        Errors = errors;
    }

    public IDictionary<string, string[]> Errors { get; }
}
