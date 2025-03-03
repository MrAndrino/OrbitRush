using orbitrush.Database.Entities.Enums;
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
    private readonly WSChatHandler _chatHandler;


    public WebSocketService(WSConnectionManager connectionManager, WSFriendHandler friendHandler, WSGameHandler gameHandler, WSPlayHandler playHandler, WSChatHandler chatHandler)
    {
        _connectionManager = connectionManager;
        _friendHandler = friendHandler;
        _gameHandler = gameHandler;
        _playHandler = playHandler;
        _chatHandler = chatHandler;
    }

    public async Task HandleAsync(WebSocket webSocket, string userId)
    {
        _connectionManager.AddConnection(userId, webSocket);
        await _connectionManager.NotifyConnectionCountAsync();
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
                "orbit",
                "leaveGame"
             };

            var chatActions = new HashSet<string>
            {
                "chatMessage",
                "getChatHistory"
             };

            while (webSocket.State == WebSocketState.Open)
            {
                string message = await ReadAsync(webSocket);

                if (!string.IsNullOrWhiteSpace(message))
                {
                    var messageData = JsonSerializer.Deserialize<GameRequestMessage>(message);

                    if (messageData == null || string.IsNullOrEmpty(messageData.Action))
                    {
                        Console.WriteLine($"Error: El mensaje no contiene una acción válida.");
                        continue;
                    }

                    if (gameActions.Contains(messageData.Action))
                    {
                        await _gameHandler.ProcessGameMessageAsync(userId, message);
                    }
                    else if (playActions.Contains(messageData.Action))
                    {
                        await _playHandler.ProcessPlayMessageAsync(userId, message);
                    }
                    else if (chatActions.Contains(messageData.Action))
                    {
                        await _chatHandler.ProcessChatMessageAsync(userId, message);
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
            await _friendHandler.HandleUpdateUserStateAsync(userId, StateEnum.Disconnected);
            await _connectionManager.RemoveConnection(userId);
            await _connectionManager.NotifyConnectionCountAsync();

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