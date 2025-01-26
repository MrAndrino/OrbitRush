using System.Net.WebSockets;
using System.Text;

public class WebSocketService
{
    private readonly WebSocketConnectionManager _connectionManager;
    private readonly WebSocketMessageHandler _messageHandler;

    public WebSocketService(WebSocketConnectionManager connectionManager, WebSocketMessageHandler messageHandler)
    {
        _connectionManager = connectionManager;
        _messageHandler = messageHandler;
    }
    
    public async Task HandleAsync(WebSocket webSocket, string userId)
    {
        _connectionManager.AddConnection(userId, webSocket);

        try
        {
            while (webSocket.State == WebSocketState.Open)
            {
                string message = await ReadAsync(webSocket);

                if (!string.IsNullOrWhiteSpace(message))
                {
                    await _messageHandler.ProcessMessageAsync(userId, message);
                }
            }
        }
        finally
        {
            _connectionManager.RemoveConnection(userId);
            if (webSocket.State == WebSocketState.Open)
            {
                await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closed by server", CancellationToken.None);
            }
        }
    }

    private async Task<string> ReadAsync(WebSocket webSocket, CancellationToken cancellation = default)
    {
        byte[] buffer = new byte[4096];
        StringBuilder stringBuilder = new();

        bool endOfMessage = false;

        do
        {
            WebSocketReceiveResult result = await webSocket.ReceiveAsync(buffer, cancellation);
            string message = System.Text.Encoding.UTF8.GetString(buffer, 0, result.Count);
            stringBuilder.Append(message);

            if (result.CloseStatus.HasValue)
            {
                await webSocket.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, cancellation);
            }

            endOfMessage = result.EndOfMessage;
        }
        while (!endOfMessage);

        return stringBuilder.ToString();
    }
}
