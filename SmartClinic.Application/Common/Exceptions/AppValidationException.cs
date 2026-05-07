namespace SmartClinic.Application.Common.Exceptions;

public class AppValidationException : Exception
{
    public Dictionary<string, string[]> Errors { get; }

    public AppValidationException(Dictionary<string, string[]> errors)
        : base("Validation failed.")
    {
        Errors = errors;
    }
}