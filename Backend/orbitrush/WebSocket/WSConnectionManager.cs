using System.Net.WebSockets;
using System.Collections.Concurrent;

public class WSConnectionManager
{
    private readonly ConcurrentDictionary<string, WebSocket> _connections = new();

    public void AddConnection(string userId, WebSocket webSocket)
    {
        _connections[userId] = webSocket;
    }

    public void RemoveConnection(string userId)
    {
        _connections.TryRemove(userId, out _);
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
        return _connections.TryGetValue(userId, out var socket) ? socket :null;
    }
}
