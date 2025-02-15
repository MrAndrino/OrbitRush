using System.Net.WebSockets;
using System.Collections.Concurrent;
using Microsoft.Extensions.DependencyInjection;

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

    public void RemoveConnection(string userId)
    {
        if (_connections.TryRemove(userId, out _))
        {
            Console.WriteLine($"🔴 Jugador {userId} desconectado.");

            using var scope = _serviceProvider.CreateScope();
            var gameHandler = scope.ServiceProvider.GetRequiredService<WSGameHandler>();

            gameHandler.HandlePlayerDisconnection(userId).ConfigureAwait(false);
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