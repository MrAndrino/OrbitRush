using orbitrush.Database.Entities;
using orbitrush.Database.Repositories;
using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

public class WSGameHandler
{
    private readonly ConcurrentDictionary<string, string> pendingInvitations = new();
    private readonly ConcurrentDictionary<string, Lobby> activeLobbies = new();
    private readonly ConcurrentQueue<string> waitingPlayers = new();
    private readonly ConcurrentDictionary<string, string> activeMatches = new();
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
                        await HandleInvitation(messageData.TargetId, userId);
                        break;

                    case "answerGameRequest":
                        await HandleAnswerInvitation(messageData.TargetId, userId, messageData.Response);
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

    private async Task HandleInvitation(string targetPlayer, string userId)
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            var unitOfWork = scope.ServiceProvider.GetRequiredService<UnitOfWork>();
            string senderName = await unitOfWork.UserRepository.GetNameByIdAsync(int.Parse(userId));

            if (_connectionManager.TryGetConnection(targetPlayer, out var targetSocket))
            {
                var invitationMessage = Encoding.UTF8.GetBytes($"{senderName} Quiere jugar contigo");
                await targetSocket.SendAsync(new ArraySegment<byte>(invitationMessage), WebSocketMessageType.Text, true, CancellationToken.None);
            }
        }
    }

    public async Task HandleAnswerInvitation(string targetPlayer, string userId, string response)
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            var unitOfWork = scope.ServiceProvider.GetRequiredService<UnitOfWork>();
            string senderName = await unitOfWork.UserRepository.GetNameByIdAsync(int.Parse(userId));
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

                pendingInvitations.TryRemove(targetPlayer, out _);
                if (response == "accept")
                {
                    var lobbyId = Guid.NewGuid().ToString();
                    Lobby lobby = new Lobby(lobbyId, targetPlayer, userId)
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
        var lobby = activeLobbies.Values.FirstOrDefault(l => l.Player1Id == userId);

        if (lobby == null)
        {
            Console.WriteLine("No se encontró ningún lobby.");
            return;
        }
        if(lobby.Player1Id != userId)
        {
            Console.WriteLine("Este usuario no tiene permisos para iniciar partida");
            return;
        }
        await StartGame(lobby.Player1Id, lobby.Player2Id);
        activeLobbies.TryRemove(lobby.Id, out _ );
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

    public async Task<string> AddPlayerToQueue(string playerId)
    {
        if (!waitingPlayers.Contains(playerId))
        {
            waitingPlayers.Enqueue(playerId);

            if (waitingPlayers.Count >= 2)
            {
                waitingPlayers.TryDequeue(out string player1);
                waitingPlayers.TryDequeue(out string player2);

                var matchId = Guid.NewGuid().ToString();
                activeMatches.TryAdd(matchId, $"{player1},{player2}");

                await NotifyPlayersOfMatch(player1, player2, matchId);

                return matchId;
            }
        }
        return null;
    }

    public string RemovePlayerFromQueue(string playerId)
    {
        waitingPlayers.TryDequeue(out _);
        return $"Player {playerId} removed from queue.";
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