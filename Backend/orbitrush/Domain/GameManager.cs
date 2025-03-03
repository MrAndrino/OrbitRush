using orbitrush.Database.Entities.Enums;
using System.Collections.Concurrent;

namespace orbitrush.Domain;

public class GameManager
{
    private readonly ConcurrentDictionary<string, GameService> _activeGames = new();
    private readonly WSConnectionManager _connectionManager;
    private readonly IServiceProvider _serviceProvider;

    public GameManager(WSConnectionManager connectionManager, IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
        _connectionManager = connectionManager;
    }

    public GameService GetOrCreateGame(string sessionId)
    {
        var game = _activeGames.GetOrAdd(sessionId, _ => new GameService(_serviceProvider));

        var connectionManager = _serviceProvider.GetRequiredService<WSConnectionManager>();
        Task.Run(() => connectionManager.NotifyActiveGameCountAsync());

        return game;
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

    public async Task RemoveGame(string sessionId)
    {
        if (_activeGames.TryRemove(sessionId, out var gameService))
        {
            using var scope = _serviceProvider.CreateScope();
            var chatHandler = scope.ServiceProvider.GetRequiredService<WSChatHandler>();
            var friendHandler = scope.ServiceProvider.GetRequiredService<WSFriendHandler>();

            chatHandler.ClearChatForSession(sessionId);

            if (!string.IsNullOrEmpty(gameService.Player1Id))
            {
                await friendHandler.HandleUpdateUserStateAsync(gameService.Player1Id, StateEnum.Connected);
            }

            if (!string.IsNullOrEmpty(gameService.Player2Id) && !gameService.Player2Id.StartsWith("BOT_"))
            {
                await friendHandler.HandleUpdateUserStateAsync(gameService.Player2Id, StateEnum.Connected);
            }

            var connectionManager = scope.ServiceProvider.GetRequiredService<WSConnectionManager>();
            await connectionManager.NotifyPlayingPlayersCountAsync();
        }
    }

    public int GetActiveGameCount()
    {
        return _activeGames.Count;
    }

    public int GetPlayingPlayersCount()
    {
        return _activeGames.Values.Sum(game =>
            (game.Player1Id != null ? 1 : 0) +
            (game.Player2Id != null && !game.Player2Id.StartsWith("BOT_") ? 1 : 0)
        );
    }
}