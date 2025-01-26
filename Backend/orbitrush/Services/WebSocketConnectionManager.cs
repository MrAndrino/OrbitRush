﻿using System.Net.WebSockets;
using System.Collections.Concurrent;

public class WebSocketConnectionManager
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
}