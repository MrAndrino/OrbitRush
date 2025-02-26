using orbitrush.Domain;
using System.Collections.Concurrent;
using System.Net.WebSockets;

public class WSConnectionManager
{
    private readonly ConcurrentDictionary<string, WebSocket> _connections = new();
    private readonly IServiceProvider _serviceProvider;


    public WSConnectionManager(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }


    public void AddConnection(string userId, WebSocket webSocket)
    {
        _connections[userId] = webSocket;
    }

    public async Task RemoveConnection(string userId)
    {
        if (_connections.TryRemove(userId, out _))
        {
            Console.WriteLine($"🔴 Jugador {userId} desconectado.");
            DisconnectionType type = DetermineDisconnectionType(userId);

            await HandleDisconnection(userId, type);
        }
    }

    private DisconnectionType DetermineDisconnectionType(string userId)
    {
        using var scope = _serviceProvider.CreateScope();
        var gameManager = scope.ServiceProvider.GetRequiredService<GameManager>();
        var gameHandler = scope.ServiceProvider.GetRequiredService<WSGameHandler>();

        if (gameManager.GetAllActiveGames().Any(g => g.Value.Player1Id == userId || g.Value.Player2Id == userId))
            return DisconnectionType.Game;

        if (gameHandler.IsPlayerInLobby(userId))
            return DisconnectionType.Lobby;

        return DisconnectionType.None;
    }

    public async Task HandleDisconnection(string userId, DisconnectionType type)
    {
        Console.WriteLine($"🔴 Jugador {userId} se ha desconectado. Determinando el contexto...");

        await Task.Delay(3000); // ⏳ Esperar para ver si se reconecta

        if (TryGetConnection(userId, out _))
        {
            Console.WriteLine($"✅ Jugador {userId} se ha reconectado. No se eliminará.");
            return;
        }

        using var scope = _serviceProvider.CreateScope();
        var gameHandler = scope.ServiceProvider.GetRequiredService<WSGameHandler>();
        var playHandler = scope.ServiceProvider.GetRequiredService<WSPlayHandler>();

        switch (type)
        {
            case DisconnectionType.Game:
                Console.WriteLine($"🎮 {userId} estaba en una partida. Llamando a HandlePlayerGameDisconnection.");
                await playHandler.HandlePlayerGameDisconnection(userId);
                break;
            case DisconnectionType.Lobby:
                Console.WriteLine($"🏠 {userId} estaba en el lobby. Llamando a HandlePlayerDisconnection.");
                await gameHandler.HandlePlayerDisconnection(userId);
                break;
            default:
                Console.WriteLine($"⚠ Tipo de desconexión desconocido para {userId}");
                break;
        }
    }


    public bool TryGetConnection(string userId, out WebSocket webSocket)
    {
        return _connections.TryGetValue(userId, out webSocket);
    }

    public IEnumerable<string> GetAllUserIds()
    {
        return _connections.Keys;
    }

    public WebSocket GetConnectionById(string userId)
    {
        return _connections.TryGetValue(userId, out var socket) ? socket : null;
    }
    public IEnumerable<WebSocket> GetAllConnections()
    {
        return _connections.Values;
    }
}