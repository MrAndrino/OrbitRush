﻿using orbitrush.Database.Entities;
using orbitrush.Database.Repositories;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

public class WSGameHandler
{
    private readonly ConcurrentDictionary<string, string> pendingInvitations = new();
    private readonly ConcurrentDictionary<string, Lobby> activeLobbies = new();
    private readonly ConcurrentQueue<string> waitingPlayers = new();
    //private readonly ConcurrentDictionary<string, GameSession> activeGames = new();
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


                    case "playWithBot":
                        await StartGameWithBot(userId);
                        break;

                    case "startGame":
                        await HandleStartGame(userId);
                        break;

                    //case "move":
                    //    await HandlePlayerMove(userId, messageData);
                    //    break;

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

            // Verificar si realmente existe una invitación pendiente
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

            // Verificar si el usuario ya está en un lobby activo
            var existingLobby = activeLobbies.FirstOrDefault(l => l.Value.Player1Id == userId || l.Value.Player2Id == userId);
            if (!string.IsNullOrEmpty(existingLobby.Key))
            {
                var lobby = existingLobby.Value;
                string opponentId = lobby.Player1Id == userId ? lobby.Player2Id : lobby.Player1Id;

                // Notificar al oponente que su compañero abandonó la partida
                if (_connectionManager.TryGetConnection(opponentId, out WebSocket opponentSocket))
                {
                    var abandonMessage = JsonSerializer.Serialize(new
                    {
                        Action = "lobbyAbandoned",
                        Message = $"{senderName} ha abandonado la partida.",
                        Suggestion = "Puedes regresar a la cola de emparejamiento o invitar a otro jugador."
                    });

                    await SendAsync(opponentSocket, abandonMessage);
                }

                // Eliminar el lobby anterior
                activeLobbies.TryRemove(existingLobby.Key, out _);
                Console.WriteLine($"Usuario {userId} salió de un lobby anterior. Notificando a {opponentId}.");
            }

            // Procesar la respuesta a la invitación
            if (_connectionManager.TryGetConnection(targetPlayer, out var socket))
            {
                var responseMessage = new
                {
                    Action = "answerGameRequest",
                    TargetId = targetPlayer,
                    Response = response
                };
                var message = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(responseMessage));
                await socket.SendAsync(new ArraySegment<byte>(message), WebSocketMessageType.Text, true, CancellationToken.None);

                if (response == "accept")
                {
                    var lobbyId = Guid.NewGuid().ToString();
                    Lobby lobby = new Lobby(lobbyId, targetPlayer, userId, false)
                    {
                        Player1Ready = true,
                        Player2Ready = true,
                    };
                    activeLobbies.TryAdd(lobbyId, lobby);
                    Console.WriteLine($"Cantidad de lobbies activos: {activeLobbies.Count}");
                    await NotifyPlayerCanStartGame(targetPlayer, lobby);
                }
                else if (response == "reject")
                {
                    var rejectMessage = new
                    {
                        Action = "rejectGameRequest",
                        TargetId = targetPlayer,
                        Response = $"{targetPlayer} ha rechazado tu invitación."
                    };
                    var rejectBuffer = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(rejectMessage));
                    await socket.SendAsync(new ArraySegment<byte>(rejectBuffer), WebSocketMessageType.Text, true, CancellationToken.None);
                }

                pendingInvitations.TryRemove(userId, out _);
                pendingInvitations.TryRemove(targetPlayer, out _);
            }
        }
    }


    private async Task NotifyPlayerCanStartGame(string playerId, Lobby lobby)
    {
        if (_connectionManager.TryGetConnection(playerId, out var socket) && socket.State == WebSocketState.Open)
        {
            var startGameMessage = new
            {
                Action = "canStartGame",
                LobbyId = lobby.Id,
                Message = "Ambos jugadores están listos. Puedes iniciar la partida."
            };

            var buffer = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(startGameMessage));
            await socket.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, CancellationToken.None);
        }
    }

    private async Task HandleStartGame(string userId)
    {
        Console.WriteLine($"🔍 Buscando lobby para el usuario: {userId}");

        var lobby = activeLobbies.Values.FirstOrDefault(l => l.Player1Id == userId);

        if (lobby == null)
        {
            Console.WriteLine("❌ No se encontró ningún lobby para iniciar la partida.");
            return;
        }

        if (lobby.Player1Id != userId)
        {
            Console.WriteLine("❌ Usuario sin permisos para iniciar la partida.");
            return;
        }

        Console.WriteLine($"✅ Iniciando partida entre {lobby.Player1Id} y {lobby.Player2Id}");
        lobby.IsActive = true; // Ahora el lobby representa la partida activa
        await StartGame(lobby.Player1Id, lobby.Player2Id);
    }



    private async Task StartGame(string player1Id, string player2Id)
    {
        var startMessagePlayer1 = new
        {
            Action = "gameStarted",
            Opponent = player2Id
        };

        var startMessagePlayer2 = new
        {
            Action = "gameStarted",
            Opponent = player1Id
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
        Console.WriteLine($"⚖️ Jugador {playerId} ha respondido al emparejamiento aleatorio: {response}");

        var lobbyEntry = activeLobbies.FirstOrDefault(l => l.Value.Player1Id == playerId || l.Value.Player2Id == playerId);

        if (!string.IsNullOrEmpty(lobbyEntry.Key))
        {
            var matchId = lobbyEntry.Key;
            var lobby = lobbyEntry.Value;
            string opponentId = lobby.Player1Id == playerId ? lobby.Player2Id : lobby.Player1Id;

            if (response == "accept")
            {
                Console.WriteLine($"✅ Jugador {playerId} ha aceptado la partida.");
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

                // Verificar si ambos jugadores han aceptado antes de iniciar la partida
                if (lobby.Player1Id == playerId)
                {
                    lobby.Player1Ready = true;
                }
                else if (lobby.Player2Id == playerId)
                {
                    lobby.Player2Ready = true;
                }

                if (lobby.Player1Ready && lobby.Player2Ready)
                {
                    if (_connectionManager.TryGetConnection(lobby.Player1Id, out var p1Socket) &&
                        _connectionManager.TryGetConnection(lobby.Player2Id, out var p2Socket))
                    {
                        await StartGame(lobby.Player1Id, lobby.Player2Id);
                    }
                }
            }
            else if (response == "reject")
            {
                Console.WriteLine($"❌ Jugador {playerId} ha rechazado la partida.");
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

                // 🔹 Eliminar al jugador que rechazó de la cola
                Console.WriteLine($"🚪 Jugador {playerId} ha rechazado y será eliminado de la cola.");
                RemovePlayerFromQueue(playerId);

                // 🔹 Volver a agregar al oponente a la cola de emparejamiento
                Console.WriteLine($"🔄 {opponentId} vuelve a la cola de emparejamiento.");
                await AddPlayerToQueue(opponentId);
            }
        }
        else
        {
            Console.WriteLine("❌ No se encontró un lobby activo para este jugador.");
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
                        Console.WriteLine($"❌ Jugador {player1} se desconectó antes de iniciar. {player2} regresa a la cola.");
                        waitingPlayers.Enqueue(player2);
                        return;
                    }

                    if (!_connectionManager.TryGetConnection(player2, out var player2Socket) || player2Socket.State != WebSocketState.Open)
                    {
                        Console.WriteLine($"❌ Jugador {player2} se desconectó antes de iniciar. {player1} regresa a la cola.");
                        waitingPlayers.Enqueue(player1);
                        return;
                    }

                    var matchId = Guid.NewGuid().ToString();
                    Lobby lobby = new Lobby(matchId, player1, player2, true);
                    activeLobbies.TryAdd(matchId, lobby);

                    Console.WriteLine($"✅ Partida encontrada: {matchId} entre {player1} y {player2}");


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
            Console.WriteLine($"❌ Error en AddPlayerToQueue: {ex.Message}");
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

    private async Task NotifyPlayersOfMatch(string player1, string player2, string matchId)
    {
        if (_connectionManager.TryGetConnection(player1, out var player1Socket) && player1Socket.State == WebSocketState.Open)
        {
            var message = $"¡Partida encontrada! Oponente: {player2}, ID de partida: {matchId}";
            var buffer = Encoding.UTF8.GetBytes(message);
            await player1Socket.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, CancellationToken.None);
        }

        if (_connectionManager.TryGetConnection(player2, out var player2Socket) && player2Socket.State == WebSocketState.Open)
        {
            var message = $"¡Partida encontrada! Oponente: {player1}, ID de partida: {matchId}";
            var buffer = Encoding.UTF8.GetBytes(message);
            await player2Socket.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, CancellationToken.None);
        }
    }

    public async Task<string> StartGameWithBot(string playerId)
    {
        Console.WriteLine($"🎮 {playerId} ha iniciado una partida contra un bot.");

        string botId = "BOT_" + Guid.NewGuid().ToString();
        var matchId = Guid.NewGuid().ToString();

        Lobby lobby = new Lobby(matchId, playerId, botId, true)
        {
            Player1Ready = true,
            Player2Ready = true,
            IsActive = true
        };
        activeLobbies.TryAdd(matchId, lobby);

        if (_connectionManager.TryGetConnection(playerId, out var playerSocket) && playerSocket.State == WebSocketState.Open)
        {
            var message = new
            {
                Action = "gameStarted",
                Opponent = "Bot",
                Message = "Has iniciado una partida contra un bot."
            };
            var buffer = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(message));
            await playerSocket.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, CancellationToken.None);
        }

        Console.WriteLine($"🤖 Bot {botId} asignado a la partida {matchId}.");

        return matchId;
    }

    public async Task HandlePlayerDisconnection(string playerId)
    {
        Console.WriteLine($"❌ Jugador {playerId} se ha desconectado. Verificando si estaba en una partida...");

        var lobbyEntry = activeLobbies.FirstOrDefault(l => l.Value.Player1Id == playerId || l.Value.Player2Id == playerId);

        if (!string.IsNullOrEmpty(lobbyEntry.Key))
        {
            var matchId = lobbyEntry.Key;
            var lobby = lobbyEntry.Value;
            string opponentId = lobby.Player1Id == playerId ? lobby.Player2Id : lobby.Player1Id;

            Console.WriteLine($"🔍 Partida encontrada ({matchId}). Verificando qué hacer...");

            if (lobby.Player2Id.StartsWith("BOT_"))
            {
                activeLobbies.TryRemove(matchId, out _);
                Console.WriteLine("🗑️ Partida contra el bot eliminada ya que el jugador se desconectó.");
            }
            else if (lobby.IsRandomMatch && !lobby.IsActive)
            {
                Console.WriteLine($"🔄 Partida {matchId} era aleatoria y aún no ha comenzado. Enviando {opponentId} de vuelta a la cola...");
                activeLobbies.TryRemove(matchId, out _);

                if (_connectionManager.TryGetConnection(opponentId, out var opponentSocket) && opponentSocket.State == WebSocketState.Open)
                {
                    var message = new
                    {
                        Action = "opponentDisconnected",
                        Message = "Tu oponente se ha desconectado. Volviendo a la cola de emparejamiento..."
                    };

                    var buffer = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(message));
                    await opponentSocket.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, CancellationToken.None);

                    await AddPlayerToQueue(opponentId);
                }
            }
            else if (lobby.IsActive)
            {
                Console.WriteLine($"⚠️ La partida {matchId} ya ha comenzado. No se devolverá a la cola.");

                if (_connectionManager.TryGetConnection(opponentId, out var opponentSocket) && opponentSocket.State == WebSocketState.Open)
                {
                    var message = new
                    {
                        Action = "opponentDisconnected",
                        Message = "Tu oponente se ha desconectado de la partida en curso."
                    };

                    var buffer = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(message));
                    await opponentSocket.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, CancellationToken.None);
                }
            }
            else
            {
                Console.WriteLine($"🎭 Partida por invitación. {opponentId} se convierte en el anfitrión.");

                if (_connectionManager.TryGetConnection(opponentId, out var opponentSocket) && opponentSocket.State == WebSocketState.Open)
                {
                    var message = new
                    {
                        Action = "opponentDisconnected",
                        Message = "Tu oponente se ha desconectado. Ahora eres el anfitrión y puedes invitar a otro jugador."
                    };

                    var buffer = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(message));
                    await opponentSocket.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, CancellationToken.None);
                }

                lobby.Player1Id = opponentId;
                lobby.Player2Id = null;
            }
        }
    }


    private async Task SendAsync(WebSocket webSocket, string message)
    {
        byte[] bytes = System.Text.Encoding.UTF8.GetBytes(message);
        await webSocket.SendAsync(bytes, WebSocketMessageType.Text, true, CancellationToken.None);
    }

    //private async Task StartGame(string userId)
    //{
    //    var matchId = activeMatches.FirstOrDefault(kvp => kvp.Value.Contains(userId)).Key;

    //    if (!string.IsNullOrEmpty(matchId) && activeMatches.TryGetValue(matchId, out var players))
    //    {
    //        var playerIds = players.Split(',');
    //        if (playerIds.Length == 2)
    //        {
    //            var player1 = playerIds[0];
    //            var player2 = playerIds[1];

    //            var gameSession = new GameSession(matchId, player1, player2);
    //            activeGames.TryAdd(matchId, gameSession);

    //            await NotifyPlayerOfStart(player1, gameSession);
    //            await NotifyPlayerOfStart(player2, gameSession);
    //        }
    //    }
    //    else
    //    {
    //        Console.WriteLine($"ID de partida {matchId} no encontrado");
    //    }
    //}

    //private async Task NotifyPlayerOfStart(string playerId, GameSession gameSession)
    //{
    //    if (_connectionManager.TryGetConnection(playerId, out var socket) && socket.State == WebSocketState.Open)
    //    {
    //        var startMessage = new
    //        {
    //            Action = "game_started",
    //            MatchId = gameSession.MatchId,
    //            Opponent = playerId == gameSession.Player1Id ? gameSession.Player2Id : gameSession.Player1Id,
    //            BoardState = gameSession.BoardState,
    //            CurrentTurn = gameSession.CurrentTurn
    //        };

    //        var buffer = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(startMessage));
    //        await socket.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, CancellationToken.None);
    //    }
    //}

    //private async Task HandlePlayerMove(string userId, GameRequestMessage messageData)
    //{
    //    if (activeGames.TryGetValue(messageData.TargetId, out var gameSession))
    //    {
    //        if (gameSession.CurrentTurn == userId)
    //        {
    //            gameSession.BoardState = "updated"; // Cambiar según la lógica del juego
    //            gameSession.CurrentTurn = userId == gameSession.Player1Id ? gameSession.Player2Id : gameSession.Player1Id;

    //            await NotifyPlayerOfMove(gameSession.Player1Id, gameSession);
    //            await NotifyPlayerOfMove(gameSession.Player2Id, gameSession);
    //        }
    //    }
    //}

    //private async Task NotifyPlayerOfMove(string playerId, GameSession gameSession)
    //{
    //    if (_connectionManager.TryGetConnection(playerId, out var socket) && socket.State == WebSocketState.Open)
    //    {
    //        var moveMessage = new
    //        {
    //            Action = "move",
    //            BoardState = gameSession.BoardState,
    //            CurrentTurn = gameSession.CurrentTurn
    //        };

    //        var buffer = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(moveMessage));
    //        await socket.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, CancellationToken.None);
    //    }
    //}
}