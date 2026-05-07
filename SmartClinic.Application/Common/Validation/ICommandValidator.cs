namespace SmartClinic.Application.Common.Validation;

public interface ICommandValidator<T>
{
    void Validate(T command);
}