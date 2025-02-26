using orbitrush.Database.Repositories;
using System.Collections.Concurrent;

namespace orbitrush.Domain;

public class GameManager
{
    private readonly ConcurrentDictionary<string, GameService> _activeGames = new();
    private readonly IServiceProvider _serviceProvider;

    public GameManager(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public GameService GetOrCreateGame(string sessionId)
    {
        return _activeGames.GetOrAdd(sessionId, _ => new GameService(_serviceProvider));
    }

    public ConcurrentDictionary<string, GameService> GetAllActiveGames()
    {
        return _activeGames;
    }

    public void RemoveGame(string sessionId)
    {
        _activeGames.TryRemove(sessionId, out _);
    }

    public int GetActiveGameCount()
    {
        return _activeGames.Count;
    }
}