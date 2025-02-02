using System.Net.WebSockets;
using System.Text;

public class WSOnlineCount
{
    private int _connectedPlayers = 0;

    public int GetConnectedPlayersCount()
    {
        return _connectedPlayers;
    }

    public void Increment()
    {
        Interlocked.Increment(ref _connectedPlayers);
    }

    public void Decrement()
    {
        Interlocked.Decrement(ref _connectedPlayers);
    }

    public async Task NotifyAllClientsAsync(IEnumerable<WebSocket> clients)
    {
        var message = Encoding.UTF8.GetBytes($"Jugadores conectados: {_connectedPlayers}");
        var tasks = clients
            .Where(ws => ws.State == WebSocketState.Open)
            .Select(ws => ws.SendAsync(new ArraySegment<byte>(message), WebSocketMessageType.Text, true, CancellationToken.None));

        await Task.WhenAll(tasks);
    }
}