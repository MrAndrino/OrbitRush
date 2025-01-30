using orbitrush.Database.Entities;
using orbitrush.Database.Repositories;
using System.Net.WebSockets;
using System.Text.Json;

public class WSFriendHandler
{
    private readonly WSConnectionManager _connectionManager;
    private readonly IServiceProvider _serviceProvider;

    public WSFriendHandler(WSConnectionManager connectionManager, IServiceProvider serviceProvider)
    {
        _connectionManager = connectionManager;
        _serviceProvider = serviceProvider;
    }
    public class FriendRequestMessage
    {
        public string Action { get; set; } = string.Empty;
        public string TargetId { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public bool Success { get; set; }
        public string ResponseMessage { get; set; } = string.Empty;
    }

    public async Task ProcessMessageAsync(string userId, string message)
    {
        try
        {
            var request = JsonSerializer.Deserialize<FriendRequestMessage>(message);

            if (request != null)
            {
                Console.WriteLine($"Received action: {request.Action}");
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
        using (var scope = _serviceProvider.CreateScope())
        {
            var unitOfWork = scope.ServiceProvider.GetRequiredService<UnitOfWork>();
            bool requestExist = await unitOfWork.FriendRequestRepository.ExistsBySenderAndTargetAsync(senderId, request.TargetId);

            if (requestExist)
            {
                string targetName = await unitOfWork.FriendRequestRepository.GetNameByIdAsync(int.Parse(request.TargetId));
                request.Success = false;
                request.ResponseMessage = $"Ya se ha enviado una petición a {targetName}";
            }

            FriendRequest friendRequest = new FriendRequest
            {
                SenderId = senderId,
                TargetId = request.TargetId,
            };

            await unitOfWork.FriendRequestRepository.UpdateAsync(friendRequest);
            await unitOfWork.SaveAsync();

            if (_connectionManager.TryGetConnection(request.TargetId, out WebSocket targetSocket))
            {
                string senderName = await unitOfWork.FriendRequestRepository.GetNameByIdAsync(int.Parse(senderId));
                string notification = JsonSerializer.Serialize(new
                {
                    Action = "friendRequestReceived",
                    FromUserId = senderId,
                    Message = $"{senderName} te ha mandado una solicitud de amistad."
                });

                await SendAsync(targetSocket, notification);
            }
            else
            {
                Console.WriteLine($"{request.TargetId} no está conectado.");
            }
        }
    }

    private async Task HandleAcceptRequestAsync(string accepterId, FriendRequestMessage request)
    {
        using (var scope = _serviceProvider.CreateScope())
        {


            var unitOfWork = scope.ServiceProvider.GetRequiredService<UnitOfWork>();
            FriendRequest friendRequest = await unitOfWork.FriendRequestRepository.FindBySenderAndTargetAsync(request.TargetId, accepterId);

            if (friendRequest == null)
            {
                request.Success = false;
                request.ResponseMessage = $"No se ha enviado ninguna petición.";
            }

            await unitOfWork.FriendRequestRepository.DeleteAsync(friendRequest);

            await unitOfWork.UserFriendRepository.InsertAsync(new UserFriend
            {
                UserId = int.Parse(accepterId),
                FriendId = int.Parse(request.TargetId),
            });

            await unitOfWork.UserFriendRepository.InsertAsync(new UserFriend
            {
                UserId = int.Parse(request.TargetId),
                FriendId = int.Parse(accepterId),
            });
            await unitOfWork.SaveAsync();


            if (_connectionManager.TryGetConnection(request.TargetId, out WebSocket targetSocket))
            {
                string accepterName = await unitOfWork.FriendRequestRepository.GetNameByIdAsync(int.Parse(accepterId));
                string notification = JsonSerializer.Serialize(new
                {
                    Action = "friendRequestReceived",
                    FromUserId = request.TargetId,
                    Message = $"{accepterName} ha aceptado tu solicitud de amistad."
                });

                await SendAsync(targetSocket, notification);
            }
        }
    }

    private async Task SendAsync(WebSocket webSocket, string message)
    {
        byte[] bytes = System.Text.Encoding.UTF8.GetBytes(message);
        await webSocket.SendAsync(bytes, WebSocketMessageType.Text, true, CancellationToken.None);
    }
}