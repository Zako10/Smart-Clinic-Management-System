namespace SmartClinic.Application.Common.Validation;

public interface ICommandValidator<in TCommand>
{
    void Validate(TCommand command);
}
