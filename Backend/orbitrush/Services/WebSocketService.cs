using orbitrush.Database.Entities.Enums;
using orbitrush.WebSocket;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using static WSGameHandler;

public class WebSocketService
{
    private readonly WSConnectionManager _connectionManager;
    private readonly WSFriendHandler _friendHandler;
    private readonly WSGameHandler _gameHandler;
    private readonly WSPlayHandler _playHandler;
    private readonly WSOnlineCount _onlineCount;

    public WebSocketService(WSConnectionManager connectionManager, WSFriendHandler friendHandler, WSOnlineCount onlineCount, WSGameHandler gameHandler, WSPlayHandler playHandler)
    {
        _connectionManager = connectionManager;
        _friendHandler = friendHandler;
        _onlineCount = onlineCount;
        _gameHandler = gameHandler;
        _playHandler = playHandler;
    }

    public async Task HandleAsync(WebSocket webSocket, string userId)
    {
        _connectionManager.AddConnection(userId, webSocket);
        _onlineCount.Increment();
        await _onlineCount.NotifyAllClientsAsync(_connectionManager.GetAllConnections());
        await _friendHandler.HandleUpdateUserStateAsync(userId, StateEnum.Connected);

        try
        {
            var gameActions = new HashSet<string>
            {
                "sendGameRequest",
                "answerGameRequest",
                "queueForMatch",
                "randomMatchResponse",
                "playWithBot",
                "startGame",
                "cancelMatchmaking",
                "getLobbyInfo",
                "leaveLobby"
             };

            var playActions = new HashSet<string>
            {
                "playMove",
                "orbit"
             };

            while (webSocket.State == WebSocketState.Open)
            {
                string message = await ReadAsync(webSocket);

                if (!string.IsNullOrWhiteSpace(message))
                {
                    var messageData = JsonSerializer.Deserialize<GameRequestMessage>(message);

                    if (messageData != null && gameActions.Contains(messageData.Action))
                    {
                        await _gameHandler.ProcessGameMessageAsync(userId, message);
                    }
                    else if (messageData != null && playActions.Contains(messageData.Action))
                    {
                        await _playHandler.ProcessPlayMessageAsync(userId, message);
                    }
                    else
                    {
                        await _friendHandler.ProcessMessageAsync(userId, message);
                    }
                }
            }
        }
        finally
        {
            _connectionManager.RemoveConnection(userId);
            _onlineCount.Decrement();
            await _onlineCount.NotifyAllClientsAsync(_connectionManager.GetAllConnections());
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
