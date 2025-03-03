using orbitrush.Database.Entities;
using orbitrush.Database.Entities.Enums;
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
                switch (request.Action)
                {
                    case "sendFriendRequest":
                        await HandleFriendRequestAsync(userId, request);
                        break;

                    case "acceptFriendRequest":
                        await HandleAcceptRequestAsync(userId, request);
                        break;

                    case "updateUserState":
                        if (Enum.TryParse<StateEnum>(request.Message, true, out var newState))
                        {
                            await HandleUpdateUserStateAsync(userId, newState);
                        }
                        break;

                    case "deleteFriend":
                        await HandleRemoveFriendAsync(userId, request);
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
            bool areFriends = await unitOfWork.UserFriendRepository.AreFriendsAsync(senderId, request.TargetId);

            if (areFriends)
            {
                request.Success = false;
                request.ResponseMessage = "Ya son amigos.";

                if (_connectionManager.TryGetConnection(senderId, out WebSocket senderSocket))
                {
                    string errorMessage = JsonSerializer.Serialize(new
                    {
                        Action = "friendRequestError",
                        Success = false,
                        ResponseMessage = request.ResponseMessage
                    });

                    await SendAsync(senderSocket, errorMessage);
                }

                return;
            }

            bool requestExist = await unitOfWork.FriendRequestRepository.ExistsBySenderAndTargetAsync(senderId, request.TargetId);

            if (requestExist)
            {
                string targetName = await unitOfWork.FriendRequestRepository.GetNameByIdAsync(int.Parse(request.TargetId));
                request.Success = false;
                request.ResponseMessage = $"Ya se ha enviado una petición a {targetName}";

                if (_connectionManager.TryGetConnection(senderId, out WebSocket senderSocket))
                {
                    string errorMessage = JsonSerializer.Serialize(new
                    {
                        Action = "friendRequestError",
                        Success = false,
                        ResponseMessage = request.ResponseMessage
                    });

                    await SendAsync(senderSocket, errorMessage);
                }

                return;
            }

            FriendRequest friendRequest = new FriendRequest
            {
                SenderId = senderId,
                TargetId = request.TargetId,
            };

            await unitOfWork.FriendRequestRepository.InsertAsync(friendRequest);
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
                return;
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
                    Action = "friendRequestAccepted",
                    FromUserId = request.TargetId,
                    Message = $"{accepterName} ha aceptado tu solicitud de amistad."
                });

                await SendAsync(targetSocket, notification);
            }

            await NotifyFriendListUpdateAsync(accepterId);
            await NotifyFriendListUpdateAsync(request.TargetId);
        }
    }
    private async Task HandleRemoveFriendAsync(string userId, FriendRequestMessage request)
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            var unitOfWork = scope.ServiceProvider.GetRequiredService<UnitOfWork>();

            var userFriends = await unitOfWork.UserFriendRepository.GetUserFriendsByIdAsync(int.Parse(userId), int.Parse(request.TargetId));
            if (!userFriends.Any())
            {
                Console.WriteLine("No hay amigos que eliminar");
                return;
            }

            await unitOfWork.UserFriendRepository.DeleteUserFriendsAsync(userFriends);
            await unitOfWork.SaveAsync();

            await NotifyFriendListUpdateAsync(userId);
            await NotifyFriendListUpdateAsync(request.TargetId);
        }
    }

    private async Task NotifyFriendListUpdateAsync(string userId)
    {
        var friends = await GetFriendsWithState(userId);

        var notification = new
        {
            Action = "updateFriendList",
            Friends = friends
        };

        if (_connectionManager.TryGetConnection(userId, out WebSocket userSocket) && userSocket.State == WebSocketState.Open)
        {
            string message = JsonSerializer.Serialize(notification);
            await SendAsync(userSocket, message);
        }
    }

    private async Task<List<object>> GetFriendsWithState(string userId)
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            var unitOfWork = scope.ServiceProvider.GetRequiredService<UnitOfWork>();
            var friendIds = await unitOfWork.UserRepository.GetFriendsIdsAsync(int.Parse(userId));

            var friends = new List<object>();
            foreach (var friendId in friendIds)
            {
                var state = StateEnum.Disconnected;
                if (_connectionManager.TryGetConnection(friendId.ToString(), out WebSocket friendSocket))
                {
                    state = StateEnum.Connected;
                }

                friends.Add(new
                {
                    UserId = friendId,
                    State = state.ToString()
                });
            }
            return friends;
        }
    }

    public async Task HandleUpdateUserStateAsync(string userId, StateEnum newState)
    {
        Console.WriteLine($"Actualizando estado de {userId} a {newState}");
        await UpdateDBUserStateAsync(userId, newState);
        await NotifyFriendsOfStateChangeAsync(userId, newState);
    }

    private async Task UpdateDBUserStateAsync(string userId, StateEnum newState)
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            var unitOfWork = scope.ServiceProvider.GetRequiredService<UnitOfWork>();
            var userRepository = unitOfWork.UserRepository;

            await userRepository.UpdateStateAsync(int.Parse(userId), newState);
            await unitOfWork.SaveAsync();
        }
    }

    private async Task NotifyFriendsOfStateChangeAsync(string userId, StateEnum newState)
    {
        var friends = await GetFriends(userId);
        var notification = new
        {
            Action = "userStateChanged",
            userId = userId,
            State = newState.ToString(),
        };

        foreach (var friendId in friends)
        {
            if (_connectionManager.TryGetConnection(friendId.ToString(), out WebSocket friendSocket) && (friendSocket.State == WebSocketState.Open))
            {
                string message = JsonSerializer.Serialize(notification);
                await SendAsync(friendSocket, message);
            }
        }
    }

    private async Task<List<int>> GetFriends(string userId)
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            var unitOfWork = scope.ServiceProvider.GetRequiredService<UnitOfWork>();
            return await unitOfWork.UserRepository.GetFriendsIdsAsync(int.Parse(userId));
        }
    }

    private async Task SendAsync(WebSocket webSocket, string message)
    {
        byte[] bytes = System.Text.Encoding.UTF8.GetBytes(message);
        await webSocket.SendAsync(bytes, WebSocketMessageType.Text, true, CancellationToken.None);
    }
}