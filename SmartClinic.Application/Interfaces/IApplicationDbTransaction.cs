namespace SmartClinic.Application.Interfaces;

public interface IApplicationDbTransaction
{
    Task ExecuteAsync(Func<Task> operation);
}
