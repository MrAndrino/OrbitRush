using orbitrush.Database.Entities;
using orbitrush.Database.Entities.Enums;
using orbitrush.Database.Repositories;
using orbitrush.Domain;
using orbitrush.Services;
using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

public class WSGameHandler
{
    private readonly ConcurrentDictionary<string, string> pendingInvitations = new();
    private readonly ConcurrentDictionary<string, Lobby> activeLobbies = new();
    private readonly ConcurrentQueue<string> waitingPlayers = new();
    private readonly WSConnectionManager _connectionManager;
    private readonly IServiceProvider _serviceProvider;

    public WSGameHandler(WSConnectionManager connectionManager, IServiceProvider serviceProvider)
    {
        _connectionManager = connectionManager;
        _serviceProvider = serviceProvider;
    }

    public class GameRequestMessage
    {
        public string Action { get; set; } = string.Empty;
        public string TargetId { get; set; } = string.Empty;
        public string Response { get; set; } = string.Empty;
    }

    public async Task ProcessGameMessageAsync(string userId, string message)
    {
        try
        {
            var messageData = JsonSerializer.Deserialize<GameRequestMessage>(message);

            if (messageData != null)
            {
                switch (messageData.Action)
                {
                    case "getLobbyInfo":
                        await SendLobbyInfo(userId, messageData.TargetId);
                        break;

                    case "sendGameRequest":
                        await HandleInvitation(userId, messageData);
                        break;

                    case "answerGameRequest":
                        await HandleAnswerInvitation(messageData.TargetId, userId, messageData.Response);
                        break;

                    case "queueForMatch":
                        await AddPlayerToQueue(userId);
                        break;

                    case "randomMatchResponse":
                        await HandleRandomMatchAcceptance(userId, messageData.Response);
                        break;

                    case "cancelMatchmaking":
                        await CancelMatchmaking(userId);
                        break;

                    case "playWithBot":
                        await StartGameWithBot(userId);
                        break;

                    case "startGame":
                        await HandleStartGame(userId);
                        break;

                    case "leaveLobby":
                        await LeaveLobby(userId);
                        break;

                    default:
                        throw new InvalidOperationException("Acción no válida");
                }
            }
        }
        catch (JsonException)
        {
            throw new InvalidOperationException("Formato de mensaje inválido");
        }
    }

    private async Task SendLobbyInfo(string userId, string lobbyId)
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            var userService = scope.ServiceProvider.GetRequiredService<UserService>();

            if (activeLobbies.TryGetValue(lobbyId, out var lobby))
            {
                var player1Profile = await userService.GetUserProfile(int.Parse(lobby.Player1Id));

                string player2Name, player2Image;

                if (!string.IsNullOrEmpty(lobby.Player2Id) && lobby.Player2Id.StartsWith("BOT_"))
                {
                    player2Name = "Botorbito";
                    player2Image = "/images/profiles/MatchBot.jpeg";
                }
                else if (!string.IsNullOrEmpty(lobby.Player2Id))
                {
                    var player2Profile = await userService.GetUserProfile(int.Parse(lobby.Player2Id));
                    player2Name = player2Profile?.Name ?? "Esperando...";
                    player2Image = player2Profile?.Image ?? "/images/OrbitRush-TrashCan.jpg";
                }
                else
                {
                    player2Name = "Esperando...";
                    player2Image = "/images/OrbitRush-TrashCan.jpg";
                }

                var response = new
                {
                    Action = "lobbyUpdated",
                    LobbyId = lobbyId,
                    Player1Id = lobby.Player1Id,
                    Player1Name = player1Profile?.Name ?? "Desconocido",
                    Player1Image = player1Profile?.Image ?? "/images/OrbitRush-TrashCan.jpg",
                    Player2Id = lobby.Player2Id,
                    Player2Name = player2Name,
                    Player2Image = player2Image
                };

                if (_connectionManager.TryGetConnection(userId, out WebSocket socket))
                {
                    await SendAsync(socket, JsonSerializer.Serialize(response));
                }
            }
        }
    }

    private async Task HandleInvitation(string senderId, GameRequestMessage request)
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            var unitOfWork = scope.ServiceProvider.GetRequiredService<UnitOfWork>();

            if (pendingInvitations.ContainsKey(senderId) && pendingInvitations[senderId] == request.TargetId)
            {
                string errorMessage = JsonSerializer.Serialize(new
                {
                    Action = "invitationError",
                    Success = false,
                    ResponseMessage = $"Ya has enviado una invitación a {request.TargetId}."
                });

                if (_connectionManager.TryGetConnection(senderId, out WebSocket senderSocket))
                {
                    await SendAsync(senderSocket, errorMessage);
                }

                return;
            }

            pendingInvitations[senderId] = request.TargetId;

            if (_connectionManager.TryGetConnection(request.TargetId, out WebSocket targetSocket))
            {
                string senderName = await unitOfWork.UserRepository.GetNameByIdAsync(int.Parse(senderId));
                string notification = JsonSerializer.Serialize(new
                {
                    Action = "invitationReceived",
                    FromUserId = senderId,
                    FromUserName = senderName,
                    Message = $"{senderName} quiere jugar contigo."
                });

                await SendAsync(targetSocket, notification);
            }
            else
            {
                Console.WriteLine($"{request.TargetId} no está conectado.");
            }
        }
    }

    public async Task HandleAnswerInvitation(string targetPlayer, string userId, string response)
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            var unitOfWork = scope.ServiceProvider.GetRequiredService<UnitOfWork>();
            string senderName = await unitOfWork.UserRepository.GetNameByIdAsync(int.Parse(userId));

            if (!pendingInvitations.ContainsKey(targetPlayer) || pendingInvitations[targetPlayer] != userId)
            {
                string errorMessage = JsonSerializer.Serialize(new
                {
                    Action = "answerGameRequestError",
                    Success = false,
                    ResponseMessage = $"No tienes una invitación pendiente de {targetPlayer}."
                });

                if (_connectionManager.TryGetConnection(userId, out WebSocket userSocket))
                {
                    await SendAsync(userSocket, errorMessage);
                }
                return;
            }

            if (_connectionManager.TryGetConnection(targetPlayer, out var targetSocket))
            {
                var responseMessage = new
                {
                    Action = "answerGameRequest",
                    TargetId = targetPlayer,
                    Response = response
                };
                await SendAsync(targetSocket, JsonSerializer.Serialize(responseMessage));

                if (response == "accept")
                {
                    var existingLobby = activeLobbies.FirstOrDefault(l => l.Value.Player1Id == targetPlayer);

                    if (!string.IsNullOrEmpty(existingLobby.Key))
                    {
                        var lobby = existingLobby.Value;

                        if (string.IsNullOrEmpty(lobby.Player2Id))
                        {
                            lobby.Player2Id = userId;
                            lobby.Player2Ready = true;
                            Console.WriteLine($"Jugador {userId} agregado al lobby existente {existingLobby.Key}");

                            await SendLobbyInfo(targetPlayer, existingLobby.Key);
                            await SendLobbyInfo(userId, existingLobby.Key);
                        }
                        else
                        {
                            Console.WriteLine($"El lobby {existingLobby.Key} ya tiene 2 jugadores. No se puede agregar otro.");
                        }
                    }
                    else
                    {
                        var lobbyId = Guid.NewGuid().ToString();
                        Lobby newLobby = new Lobby(lobbyId, targetPlayer, userId, false)
                        {
                            Player1Ready = true,
                            Player2Ready = true,
                        };
                        activeLobbies.TryAdd(lobbyId, newLobby);
                        Console.WriteLine($"Nuevo lobby creado: {lobbyId} entre {targetPlayer} y {userId}");

                        await SendLobbyInfo(userId, lobbyId);
                        await SendLobbyInfo(targetPlayer, lobbyId);

                        var lobbyCreatedMessage = JsonSerializer.Serialize(new
                        {
                            Action = "lobbyCreated",
                            LobbyId = lobbyId,
                            Message = "Se ha creado un nuevo lobby. Redirigiendo..."
                        });

                        if (_connectionManager.TryGetConnection(targetPlayer, out WebSocket targetSocketLobby))
                        {
                            await SendAsync(targetSocketLobby, lobbyCreatedMessage);
                        }

                        if (_connectionManager.TryGetConnection(userId, out WebSocket senderSocketLobby))
                        {
                            await SendAsync(senderSocketLobby, lobbyCreatedMessage);
                        }
                    }
                }
                else if (response == "reject")
                {
                    var rejectMessage = new
                    {
                        Action = "rejectGameRequest",
                        TargetId = targetPlayer,
                        Response = $"{senderName} ha rechazado tu invitación."
                    };
                    await SendAsync(targetSocket, JsonSerializer.Serialize(rejectMessage));
                }

                pendingInvitations.TryRemove(userId, out _);
                pendingInvitations.TryRemove(targetPlayer, out _);
            }
        }
    }

    private async Task HandleStartGame(string userId)
    {
        var lobbyEntry = activeLobbies.FirstOrDefault(l => l.Value.Player1Id == userId);
        if (string.IsNullOrEmpty(lobbyEntry.Key)) return;

        var lobbyId = lobbyEntry.Key;
        var lobby = lobbyEntry.Value;

        if (lobby.Player1Id != userId) return;

        string sessionId = Guid.NewGuid().ToString();

        using (var scope = _serviceProvider.CreateScope())
        {
            var gameManager = scope.ServiceProvider.GetRequiredService<GameManager>();

            var gameService = gameManager.GetOrCreateGame(sessionId);
            gameService.InitializeGame(lobby.Player1Id, lobby.Player2Id, sessionId);

            var friendHandler = scope.ServiceProvider.GetRequiredService<WSFriendHandler>();

            await friendHandler.HandleUpdateUserStateAsync(lobby.Player1Id, StateEnum.Playing);
            if (!string.IsNullOrEmpty(lobby.Player2Id) && !lobby.Player2Id.StartsWith("BOT_"))
            {
                await friendHandler.HandleUpdateUserStateAsync(lobby.Player2Id, StateEnum.Playing);
            }

            await StartGame(lobby.Player1Id, lobby.Player2Id, sessionId);

            var playHandler = scope.ServiceProvider.GetRequiredService<WSPlayHandler>();
            await playHandler.BroadcastGameStateAsync(sessionId);
        }

        await _connectionManager.NotifyPlayingPlayersCountAsync();
        activeLobbies.TryRemove(lobbyId, out _);
    }

    private async Task StartGame(string player1Id, string player2Id, string sessionId)
    {
        var startMessagePlayer1 = new
        {
            Action = "gameStarted",
            SessionId = sessionId,
            Player1Id = player1Id,
            Player2Id = player2Id
        };

        var startMessagePlayer2 = new
        {
            Action = "gameStarted",
            SessionId = sessionId,
            Player1Id = player1Id,
            Player2Id = player2Id
        };

        if (_connectionManager.TryGetConnection(player1Id, out var player1Socket) && player1Socket.State == WebSocketState.Open)
        {
            var buffer = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(startMessagePlayer1));
            await player1Socket.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, CancellationToken.None);
        }

        if (_connectionManager.TryGetConnection(player2Id, out var player2Socket) && player2Socket.State == WebSocketState.Open)
        {
            var buffer = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(startMessagePlayer2));
            await player2Socket.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, CancellationToken.None);
        }
    }

    public async Task HandleRandomMatchAcceptance(string playerId, string response)
    {
        Console.WriteLine($"Jugador {playerId} ha respondido al emparejamiento aleatorio: {response}");

        var lobbyEntry = activeLobbies.FirstOrDefault(l => l.Value.Player1Id == playerId || l.Value.Player2Id == playerId);

        if (!string.IsNullOrEmpty(lobbyEntry.Key))
        {
            var matchId = lobbyEntry.Key;
            var lobby = lobbyEntry.Value;
            string opponentId = lobby.Player1Id == playerId ? lobby.Player2Id : lobby.Player1Id;

            if (response == "accept")
            {
                Console.WriteLine($"Jugador {playerId} ha aceptado la partida.");
                lobby.IsActive = true;

                if (_connectionManager.TryGetConnection(opponentId, out var opponentSocket))
                {
                    var acceptMessage = JsonSerializer.Serialize(new
                    {
                        Action = "randomMatchAccepted",
                        Message = "Tu oponente ha aceptado la partida."
                    });
                    await SendAsync(opponentSocket, acceptMessage);
                }

                lobby.Player1Ready = (lobby.Player1Id == playerId) ? true : lobby.Player1Ready;
                lobby.Player2Ready = (lobby.Player2Id == playerId) ? true : lobby.Player2Ready;

                if (lobby.Player1Ready && lobby.Player2Ready)
                {
                    await HandleStartGame(lobby.Player1Id);
                }
            }
            else if (response == "reject")
            {
                Console.WriteLine($"Jugador {playerId} ha rechazado la partida.");
                activeLobbies.TryRemove(matchId, out _);

                if (_connectionManager.TryGetConnection(opponentId, out var opponentSocket))
                {
                    var rejectMessage = JsonSerializer.Serialize(new
                    {
                        Action = "randomMatchRejected",
                        Message = "Tu oponente ha rechazado la partida. Volviendo a la cola..."
                    });
                    await SendAsync(opponentSocket, rejectMessage);
                }

                Console.WriteLine($"Jugador {playerId} ha rechazado y será eliminado de la cola.");
                RemovePlayerFromQueue(playerId);

                Console.WriteLine($"Jugador {opponentId} vuelve a la cola de emparejamiento.");
                await AddPlayerToQueue(opponentId);
            }
        }
        else
        {
            Console.WriteLine(" No se encontró un lobby activo para este jugador.");
        }
    }

    public async Task AddPlayerToQueue(string playerId)
    {
        try
        {
            if (!waitingPlayers.Contains(playerId))
            {
                waitingPlayers.Enqueue(playerId);
                Console.WriteLine($"Jugador {playerId} agregado a la cola. Total en cola: {waitingPlayers.Count}");

                if (waitingPlayers.Count >= 2)
                {
                    waitingPlayers.TryDequeue(out string player1);
                    waitingPlayers.TryDequeue(out string player2);

                    if (!_connectionManager.TryGetConnection(player1, out var player1Socket) || player1Socket.State != WebSocketState.Open)
                    {
                        Console.WriteLine($"Jugador {player1} se desconectó antes de iniciar. {player2} regresa a la cola.");
                        waitingPlayers.Enqueue(player2);
                        return;
                    }

                    if (!_connectionManager.TryGetConnection(player2, out var player2Socket) || player2Socket.State != WebSocketState.Open)
                    {
                        Console.WriteLine($"Jugador {player2} se desconectó antes de iniciar. {player1} regresa a la cola.");
                        waitingPlayers.Enqueue(player1);
                        return;
                    }

                    var matchId = Guid.NewGuid().ToString();
                    Lobby lobby = new Lobby(matchId, player1, player2, true);
                    activeLobbies.TryAdd(matchId, lobby);

                    Console.WriteLine($"Partida encontrada: {matchId} entre {player1} y {player2}");


                    var matchRequest = JsonSerializer.Serialize(new
                    {
                        Action = "randomMatchFound",
                        Opponent = player2,
                        MatchId = matchId,
                        Message = "Se ha encontrado un oponente. ¿Aceptas la partida?"
                    });

                    await SendAsync(player1Socket, matchRequest);

                    var matchRequestForPlayer2 = JsonSerializer.Serialize(new
                    {
                        Action = "randomMatchFound",
                        Opponent = player1,
                        MatchId = matchId,
                        Message = "Se ha encontrado un oponente. ¿Aceptas la partida?"
                    });

                    await SendAsync(player2Socket, matchRequestForPlayer2);
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error en AddPlayerToQueue: {ex.Message}");
        }
    }

    public async Task CancelMatchmaking(string playerId)
    {
        string result = RemovePlayerFromQueue(playerId);
        Console.WriteLine($" {playerId} ha cancelado el matchmaking. {result}");

        if (_connectionManager.TryGetConnection(playerId, out WebSocket playerSocket))
        {
            var cancelMessage = JsonSerializer.Serialize(new
            {
                Action = "matchmakingCancelled",
                Message = "Has cancelado el matchmaking."
            });

            await SendAsync(playerSocket, cancelMessage);
        }
    }

    public string RemovePlayerFromQueue(string playerId)
    {
        var newQueue = new ConcurrentQueue<string>();

        while (waitingPlayers.TryDequeue(out string currentPlayer))
        {
            if (currentPlayer != playerId)
            {
                newQueue.Enqueue(currentPlayer);
            }
        }

        while (newQueue.TryDequeue(out string remainingPlayer))
        {
            waitingPlayers.Enqueue(remainingPlayer);
        }

        return $"El jugador ha sido retirado de la lista de espera.";
    }

    public async Task<string> StartGameWithBot(string playerId)
    {
        Console.WriteLine($"{playerId} ha iniciado una partida contra un bot.");

        string botId = "BOT_" + Guid.NewGuid().ToString();
        var matchId = Guid.NewGuid().ToString();

        Lobby lobby = new Lobby(matchId, playerId, botId, false)
        {
            Player1Ready = false,
            Player2Ready = true,
            IsActive = false
        };
        activeLobbies.TryAdd(matchId, lobby);

        if (_connectionManager.TryGetConnection(playerId, out var playerSocket) && playerSocket.State == WebSocketState.Open)
        {
            var message = new
            {
                Action = "lobbyCreated",
                LobbyId = matchId,
                Player1Id = playerId,
                Player2Id = botId,
                Message = "Se ha creado un lobby contra un bot. Esperando que inicies la partida."
            };
            var buffer = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(message));
            await playerSocket.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, CancellationToken.None);
        }

        Console.WriteLine($"Bot {botId} asignado a la partida {matchId}.");

        return matchId;
    }

    private async Task HandlePlayerExit(string playerId, bool isDisconnection)
    {
        Console.WriteLine(isDisconnection
            ? $"Jugador {playerId} se ha desconectado."
            : $"Jugador {playerId} ha salido del lobby.");

        var lobbyEntry = activeLobbies.FirstOrDefault(l => l.Value.Player1Id == playerId || l.Value.Player2Id == playerId);

        if (string.IsNullOrEmpty(lobbyEntry.Key))
        {
            Console.WriteLine($"No se encontró lobby para el jugador {playerId}");
            return;
        }

        var lobbyId = lobbyEntry.Key;
        var lobby = lobbyEntry.Value;
        string opponentId = lobby.Player1Id == playerId ? lobby.Player2Id : lobby.Player1Id;

        using (var scope = _serviceProvider.CreateScope())
        {
            var friendHandler = scope.ServiceProvider.GetRequiredService<WSFriendHandler>();
            if (!playerId.StartsWith("BOT_"))
            {
                await friendHandler.HandleUpdateUserStateAsync(playerId, StateEnum.Connected);
            }
        }

        WebSocket userSocket;
        if (_connectionManager.TryGetConnection(playerId, out userSocket))
        {
            var leaveMessage = new
            {
                Action = "leftLobby",
                Message = "Has salido del lobby."
            };
            await SendAsync(userSocket, JsonSerializer.Serialize(leaveMessage));
        }

        if (!string.IsNullOrEmpty(lobby.Player2Id) && lobby.Player2Id.StartsWith("BOT_"))
        {
            activeLobbies.TryRemove(lobbyId, out _);
            Console.WriteLine($"Lobby {lobbyId} eliminado porque el jugador humano salió y el oponente era un bot.");
            return;
        }

        if (lobby.Player1Id == playerId)
        {
            if (!string.IsNullOrEmpty(opponentId))
            {
                lobby.Player1Id = opponentId;
                lobby.Player2Id = null;
                Console.WriteLine($"{opponentId} ahora es el nuevo anfitrión del lobby {lobbyId}");

                if (_connectionManager.TryGetConnection(opponentId, out var opponentSocket))
                {
                    var hostChangeMessage = new
                    {
                        Action = "lobbyHostChanged",
                        Message = isDisconnection
                            ? "Tu oponente se ha desconectado. Ahora eres el anfitrión."
                            : "El anfitrión ha salido. Ahora eres el nuevo anfitrión.",
                        LobbyId = lobbyId
                    };
                    await SendAsync(opponentSocket, JsonSerializer.Serialize(hostChangeMessage));
                }

                await SendLobbyInfo(opponentId, lobbyId);
            }
            else
            {
                activeLobbies.TryRemove(lobbyId, out _);
                Console.WriteLine($"Lobby {lobbyId} eliminado porque no hay más jugadores.");
            }
        }
        else
        {
            lobby.Player2Id = null;
            Console.WriteLine($"Jugador {playerId} ha salido del lobby {lobbyId}.");

            if (_connectionManager.TryGetConnection(lobby.Player1Id, out var hostSocket))
            {
                var playerLeftMessage = new
                {
                    Action = "playerLeftLobby",
                    Message = isDisconnection
                        ? "Tu oponente se ha desconectado del lobby."
                        : "Tu oponente ha salido del lobby.",
                    LobbyId = lobbyId
                };
                await SendAsync(hostSocket, JsonSerializer.Serialize(playerLeftMessage));
            }

            await SendLobbyInfo(lobby.Player1Id, lobbyId);
        }
    }

    public async Task LeaveLobby(string userId)
    {
        await HandlePlayerExit(userId, isDisconnection: false);
    }

    public async Task HandlePlayerDisconnection(string playerId)
    {
        await HandlePlayerExit(playerId, isDisconnection: true);
    }

    public bool IsPlayerInLobby(string userId)
    {
        return activeLobbies.Values.Any(lobby => lobby.Player1Id.Contains(userId) || lobby.Player2Id.Contains(userId));
    }

    private async Task SendAsync(WebSocket webSocket, string message)
    {
        byte[] bytes = System.Text.Encoding.UTF8.GetBytes(message);
        await webSocket.SendAsync(bytes, WebSocketMessageType.Text, true, CancellationToken.None);
    }
}