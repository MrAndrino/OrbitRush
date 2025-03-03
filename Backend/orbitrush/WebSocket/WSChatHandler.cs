using orbitrush.Database.Repositories;
using orbitrush.Domain;
using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

public class WSChatHandler
{
    private readonly WSConnectionManager _connectionManager;
    private readonly ConcurrentDictionary<string, List<ChatMessage>> _chatMessages;
    private readonly IServiceProvider _serviceProvider;

    public WSChatHandler(WSConnectionManager connectionManager, IServiceProvider serviceProvider)
    {
        _connectionManager = connectionManager;
        _chatMessages = new ConcurrentDictionary<string, List<ChatMessage>>();
        _serviceProvider = serviceProvider;
    }

    private class ChatRequest
    {
        public string Action { get; set; } = string.Empty;
        public string SessionId { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }

    private class ChatMessage
    {
        public string SenderId { get; set; }
        public string SenderName { get; set; }
        public string Message { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public async Task ProcessChatMessageAsync(string userId, string message)
    {
        try
        {
            var chatData = JsonSerializer.Deserialize<ChatRequest>(message);
            if (chatData == null) throw new InvalidOperationException("Mensaje de chat inválido");

            switch (chatData.Action)
            {
                case "chatMessage":
                    await HandleChatMessage(userId, chatData.SessionId, chatData.Message);
                    break;

                case "getChatHistory":
                    await SendChatHistory(userId, chatData.SessionId);
                    break;

                default:
                    Console.WriteLine($"Acción desconocida en el chat: {chatData.Action}");
                    break;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error en ProcessChatAsync: {ex.Message}");
        }
    }

    private async Task HandleChatMessage(string userId, string sessionId, string message)
    {
        if (string.IsNullOrEmpty(sessionId))
        {
            Console.WriteLine($"Error: El jugador {userId} intentó enviar un mensaje sin estar en una partida.");
            return;
        }

        using var scope = _serviceProvider.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<UnitOfWork>();
        string senderName = await unitOfWork.UserRepository.GetNameByIdAsync(int.Parse(userId));

        var chatMessage = new ChatMessage
        {
            SenderId = userId,
            SenderName = senderName,
            Message = message,
            Timestamp = DateTime.UtcNow
        };

        _chatMessages.AddOrUpdate(sessionId,
            _ => new List<ChatMessage> { chatMessage },
            (_, list) =>
            {
                list.Add(chatMessage);
                return list;
            });

        await BroadcastMessage(sessionId, chatMessage);
    }


    public async Task SendChatHistory(string userId, string sessionId)
    {
        if (_chatMessages.TryGetValue(sessionId, out var messages))
        {
            var history = messages.Select(m => new
            {
                Action = "chatHistory",
                SessionId = sessionId,
                Messages = messages.Select(m => new
                {
                    SenderId = m.SenderId,
                    SenderName = m.SenderName,
                    Message = m.Message,
                    Timestamp = m.Timestamp.ToString("HH:mm")
                }).ToList()
            });

            var jsonHistory = JsonSerializer.Serialize(history);

            if (_connectionManager.TryGetConnection(userId, out var socket) && socket.State == WebSocketState.Open)
            {
                var buffer = Encoding.UTF8.GetBytes(jsonHistory);
                await socket.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, CancellationToken.None);
            }
        }
    }

    private async Task BroadcastMessage(string sessionId, ChatMessage chatMessage)
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            var gameManager = scope.ServiceProvider.GetRequiredService<GameManager>();
            var gameService = gameManager.GetOrCreateGame(sessionId);
            if (gameService == null)
            {
                Console.WriteLine($"No se encontró una partida activa con SessionId: {sessionId}");
                return;
            }

            var formattedMessage = JsonSerializer.Serialize(new
            {
                Action = "chatMessage",
                SenderId = chatMessage.SenderId,
                SenderName = chatMessage.SenderName,
                Message = chatMessage.Message,
                Timestamp = chatMessage.Timestamp.ToString("HH:mm")
            });

            var buffer = Encoding.UTF8.GetBytes(formattedMessage);

            string player1Id = gameService.Player1Id;
            string player2Id = gameService.Player2Id;

            if (_connectionManager.TryGetConnection(player1Id, out WebSocket player1Socket) && player1Socket.State == WebSocketState.Open)
            {
                await player1Socket.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, CancellationToken.None);
            }

            if (!string.IsNullOrEmpty(player2Id) && _connectionManager.TryGetConnection(player2Id, out WebSocket player2Socket) && player2Socket.State == WebSocketState.Open)
            {
                await player2Socket.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, CancellationToken.None);
            }
        }
    }

    public void ClearChatForSession(string sessionId)
    {
        _chatMessages.TryRemove(sessionId, out _);
    }
}