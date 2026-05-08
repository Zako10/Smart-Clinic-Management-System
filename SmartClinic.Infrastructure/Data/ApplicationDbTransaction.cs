using SmartClinic.Application.Interfaces;

namespace SmartClinic.Infrastructure.Data;

public class ApplicationDbTransaction : IApplicationDbTransaction
{
    private readonly ApplicationDbContext _db;

    public ApplicationDbTransaction(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task ExecuteAsync(Func<Task> operation)
    {
        var strategy = _db.Database.CreateExecutionStrategy();

        await strategy.ExecuteAsync<Func<Task>, bool>(
            operation,
            async (_, innerOperation, cancellationToken) =>
            {
                await using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);
                await innerOperation();
                await transaction.CommitAsync(cancellationToken);
                return true;
            },
            null,
            default);
    }
}
