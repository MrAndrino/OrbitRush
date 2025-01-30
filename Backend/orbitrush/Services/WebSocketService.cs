using orbitrush.Database.Entities.Enums;
using System.Net.WebSockets;
using System.Text;

public class WebSocketService
{
    private readonly WSConnectionManager _connectionManager;
    private readonly WSFriendHandler _friendHandler;

    public WebSocketService(WSConnectionManager connectionManager, WSFriendHandler friendHandler)
    {
        _connectionManager = connectionManager;
        _friendHandler = friendHandler;
    }

    public async Task HandleAsync(WebSocket webSocket, string userId)
    {
        _connectionManager.AddConnection(userId, webSocket);
        await _friendHandler.HandleUpdateUserStateAsync(userId, StateEnum.Connected);

        try
        {
            while (webSocket.State == WebSocketState.Open)
            {
                string message = await ReadAsync(webSocket);

                if (!string.IsNullOrWhiteSpace(message))
                {
                    await _friendHandler.ProcessMessageAsync(userId, message);
                }
            }
        }
        finally
        {
            _connectionManager.RemoveConnection(userId);
            await _friendHandler.HandleUpdateUserStateAsync(userId, StateEnum.Disconnected);

            if (webSocket.State == WebSocketState.Open)
            {
                await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Cerrado por el servidor", CancellationToken.None);
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

            string partialMessage = Encoding.UTF8.GetString(buffer, 0, result.Count);
            stringBuilder.Append(partialMessage);

            if (result.CloseStatus.HasValue)
            {
                await webSocket.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, cancellation);
            }

            endOfMessage = result.EndOfMessage;
        }
        while (!endOfMessage);

        string fullMessage = stringBuilder.ToString();

        return fullMessage;
    }
}
