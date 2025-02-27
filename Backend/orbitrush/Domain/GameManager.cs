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

    public string GetActiveGameById(string userId)
    {
        var activeGame = GetAllActiveGames()
            .FirstOrDefault(g => g.Value.Player1Id == userId || g.Value.Player2Id == userId);

        if (!string.IsNullOrEmpty(activeGame.Key))
        {
            return activeGame.Key;
        }

        return null;
    }

    public void RemoveGame(string sessionId)
    {
        if (_activeGames.TryRemove(sessionId, out _))
        {
            Console.WriteLine($":wastebasket: Partida {sessionId} eliminada.");

            using var scope = _serviceProvider.CreateScope();
            var chatHandler = scope.ServiceProvider.GetRequiredService<WSChatHandler>();

            chatHandler.ClearChatForSession(sessionId);
            Console.WriteLine($":wastebasket: Historial de chat de la partida {sessionId} eliminado.");
        }
    }


    public int GetActiveGameCount()
    {
        return _activeGames.Count;
    }
}