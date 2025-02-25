using orbitrush.Database.Repositories;
using System.Collections.Concurrent;

namespace orbitrush.Domain;

public class GameManager
{
    private readonly ConcurrentDictionary<string, GameService> _activeGames = new();
    private readonly UnitOfWork _unitOfWork;

    public GameManager (UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public GameService GetOrCreateGame(string sessionId)
    {
        return _activeGames.GetOrAdd(sessionId, _ => new GameService(_unitOfWork)); 
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