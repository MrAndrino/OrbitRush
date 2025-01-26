using System.Net.WebSockets;
using System.Text.Json;

public class WebSocketMessageHandler
{
    private readonly WebSocketConnectionManager _connectionManager;

    public WebSocketMessageHandler(WebSocketConnectionManager connectionManager)
    {
        _connectionManager = connectionManager;
    }

    public async Task ProcessMessageAsync(string userId, string message)
    {
        try
        {
            var request = JsonSerializer.Deserialize<FriendRequestMessage>(message);

            if (request != null)
            {
                switch (request.Action)
                {
                    case "sendFriendRequest":
                        await HandleFriendRequestAsync(userId, request);
                        break;

                    case "acceptFriendRequest":
                        await HandleAcceptRequestAsync(userId, request);
                        break;

                    default:
                        throw new InvalidOperationException("Invalid action.");
                }
            }
        }
        catch (JsonException)
        {
            throw new InvalidOperationException("Invalid message format.");
        }
    }

    private async Task HandleFriendRequestAsync(string senderId, FriendRequestMessage request)
    {
        if (_connectionManager.TryGetConnection(request.TargetUserId, out WebSocket targetSocket))
        {
            string notification = JsonSerializer.Serialize(new
            {
                Action = "friendRequestReceived",
                FromUserId = senderId,
                Message = request.Message
            });

            await SendAsync(targetSocket, notification);
        }
    }

    private async Task HandleAcceptRequestAsync(string accepterId, FriendRequestMessage request)
    {
        if (_connectionManager.TryGetConnection(request.TargetUserId, out WebSocket targetSocket))
        {
            string notification = JsonSerializer.Serialize(new
            {
                Action = "friendRequestAccepted",
                FromUserId = accepterId
            });

            await SendAsync(targetSocket, notification);
        }
    }

    private async Task SendAsync(WebSocket webSocket, string message)
    {
        byte[] bytes = System.Text.Encoding.UTF8.GetBytes(message);
        await webSocket.SendAsync(bytes, WebSocketMessageType.Text, true, CancellationToken.None);
    }
}

public class FriendRequestMessage
{
    public string Action { get; set; } = string.Empty; // "sendFriendRequest" o "acceptFriendRequest"
    public string TargetUserId { get; set; } = string.Empty; // Usuario destinatario
    public string Message { get; set; } = string.Empty; // Mensaje opcional
}
