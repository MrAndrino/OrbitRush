using orbitrush.Domain;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

public class WSPlayHandler
{
    private readonly WSConnectionManager _connectionManager;
    private readonly IServiceProvider _serviceProvider;

    public WSPlayHandler(WSConnectionManager connectionManager, IServiceProvider serviceProvider)
    {
        _connectionManager = connectionManager;
        _serviceProvider = serviceProvider;
    }

    public class PlayMessage
    {
        public string Action { get; set; }
        public int Row { get; set; }
        public int Col { get; set; }
        public string SessionId { get; set; }
    }

    public async Task ProcessPlayMessageAsync(string userId, string message)
    {
        try
        {
            var playMessage = JsonSerializer.Deserialize<PlayMessage>(message);
            if (playMessage == null || string.IsNullOrEmpty(playMessage.SessionId))
                throw new InvalidOperationException("Mensaje inválido o falta SessionId");

            using (var scope = _serviceProvider.CreateScope())
            {
                var gameManager = scope.ServiceProvider.GetRequiredService<GameManager>();
                var gameService = gameManager.GetOrCreateGame(playMessage.SessionId);
                string responseMessage = "";

                switch (playMessage.Action)
                {
                    case "playMove":
                        responseMessage = gameService.PlayMove(userId, playMessage.Row, playMessage.Col);
                        await BroadcastGameStateAsync(playMessage.SessionId);
                        break;

                    case "orbit":
                        await gameService.PerformOrbit();
                        await BroadcastGameStateAsync(playMessage.SessionId);
                        if (gameService.State == GameState.GameOver)
                        {
                            await NotifyGameOverAsync(playMessage.SessionId);
                        }
                        break;

                    case "leaveGame":
                        await LeaveGame(userId);
                        break;

                    default:
                        responseMessage = "Error: Acción no válida.";
                        break;
                }

                // 🔹 Enviar la respuesta al jugador sin cerrar la conexión
                if (!string.IsNullOrEmpty(responseMessage))
                {
                    await SendMessageToPlayerAsync(userId, responseMessage);
                }
            }
        }
        catch (JsonException)
        {
            await SendMessageToPlayerAsync(userId, "Error: Formato de mensaje inválido.");
        }
        catch (InvalidOperationException ex)
        {
            await SendMessageToPlayerAsync(userId, $"Error: {ex.Message}");
        }
        catch (Exception ex)
        {
            await SendMessageToPlayerAsync(userId, $"Error inesperado: {ex.Message}");
        }
    }

    private async Task BroadcastGameStateAsync(string sessionId)
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            var gameManager = scope.ServiceProvider.GetRequiredService<GameManager>();
            var gameService = gameManager.GetOrCreateGame(sessionId);
            var boardState = new CellState[16];
            for (int i = 0; i < 4; i++)
            {
                for (int j = 0; j < 4; j++)
                {
                    boardState[i * 4 + j] = gameService.Board.Grid[i, j];
                }
            }
            var gameState = new
            {
                action = "gameState",
                sessionId = sessionId,
                board = boardState,
                currentPlayer = gameService.Board.CurrentPlayer.ToString(),
                state = gameService.State.ToString()
            };

            var jsonMessage = JsonSerializer.Serialize(gameState);
            var buffer = Encoding.UTF8.GetBytes(jsonMessage);

            foreach (var socket in _connectionManager.GetAllConnections())
            {
                if (socket.State == WebSocketState.Open)
                {
                    await socket.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, CancellationToken.None);
                }
            }
        }
    }

    private async Task NotifyGameOverAsync(string sessionId)
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            var gameManager = scope.ServiceProvider.GetRequiredService<GameManager>();
            var gameService = gameManager.GetOrCreateGame(sessionId);
            var winner = gameService.Board.CheckWinner();

            var gameOverMessage = new
            {
                action = "gameOver",
                sessionId = sessionId,
                winner = winner.ToString()
            };

            var jsonMessage = JsonSerializer.Serialize(gameOverMessage);
            var buffer = Encoding.UTF8.GetBytes(jsonMessage);

            foreach (var socket in _connectionManager.GetAllConnections())
            {
                if (socket.State == WebSocketState.Open)
                {
                    await socket.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, CancellationToken.None);
                }
            }
        }
    }

    private async Task SendMessageToPlayerAsync(string userId, string message)
    {
        var socket = _connectionManager.GetConnectionById(userId);
        if (socket != null && socket.State == WebSocketState.Open)
        {
            var jsonMessage = JsonSerializer.Serialize(new { message });
            var buffer = Encoding.UTF8.GetBytes(jsonMessage);
            await socket.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, CancellationToken.None);
        }
    }

    private async Task HandlePlayerExitFromGame(string playerId, bool isDisconnection)
    {
        Console.WriteLine(isDisconnection
            ? $"Jugador {playerId} se ha desconectado de la partida."
            : $"Jugador {playerId} ha salido de la partida.");

        using (var scope = _serviceProvider.CreateScope())
        {
            var gameManager = scope.ServiceProvider.GetRequiredService<GameManager>();
            var gameEntry = gameManager.GetAllActiveGames()
                .FirstOrDefault(g => g.Value.Player1Id == playerId || g.Value.Player2Id == playerId);

            if (string.IsNullOrEmpty(gameEntry.Key))
            {
                Console.WriteLine($"No se encontró partida activa para el jugador {playerId}");
                return;
            }

            var sessionId = gameEntry.Key;
            var gameService = gameEntry.Value;
            string opponentId = gameService.Player1Id == playerId ? gameService.Player2Id : gameService.Player1Id;

            WebSocket userSocket;
            if (_connectionManager.TryGetConnection(playerId, out userSocket))
            {
                var leaveMessage = new
                {
                    Action = "leftGame",
                    Message = "Has salido de la partida."
                };
                await SendAsync(userSocket, JsonSerializer.Serialize(leaveMessage));
            }

            // 🔹 Si el oponente es un bot, eliminar la partida y salir
            if (!string.IsNullOrEmpty(gameService.Player2Id) && gameService.Player2Id.StartsWith("BOT_"))
            {
                gameManager.RemoveGame(sessionId);
                Console.WriteLine($"Partida {sessionId} eliminada porque el jugador humano salió y el oponente era un bot.");
                return;
            }

            // 🔹 Si el jugador que sale es el Player1
            if (gameService.Player1Id == playerId)
            {
                if (!string.IsNullOrEmpty(opponentId))
                {
                    gameService.State = GameState.GameOver;
                    Console.WriteLine($"{opponentId} ha ganado automáticamente la partida {sessionId} porque su oponente abandonó.");
                    await gameService.SaveMatchData(gameService.Player1Id == playerId ? gameService.Player2Piece : gameService.Player1Piece);

                    if (_connectionManager.TryGetConnection(opponentId, out var opponentSocket))
                    {
                        var winMessage = new
                        {
                            Action = "opponentLeft",
                            Message = isDisconnection
                                ? "Tu oponente se ha desconectado. Ganaste la partida automáticamente."
                                : "Tu oponente ha abandonado. Ganaste la partida.",
                            SessionId = sessionId
                        };
                        await SendAsync(opponentSocket, JsonSerializer.Serialize(winMessage));
                    }

                    await NotifyGameOverAsync(sessionId, opponentId);
                }
                else
                {
                    // 🗑 Si no hay oponente, eliminar la partida
                    gameManager.RemoveGame(sessionId);
                    Console.WriteLine($"Partida {sessionId} eliminada porque no hay más jugadores.");
                }
            }
            else
            {
                // 🚪 Si el Player2 se va, simplemente asignamos la victoria al Player1
                gameService.State = GameState.GameOver;
                Console.WriteLine($"Jugador {playerId} ha salido de la partida {sessionId}. {gameService.Player1Id} gana automáticamente.");

                if (_connectionManager.TryGetConnection(gameService.Player1Id, out var hostSocket))
                {
                    var playerLeftMessage = new
                    {
                        Action = "opponentLeft",
                        Message = isDisconnection
                            ? "Tu oponente se ha desconectado de la partida. Ganaste automáticamente."
                            : "Tu oponente ha salido de la partida. Ganaste automáticamente.",
                        SessionId = sessionId
                    };
                    await SendAsync(hostSocket, JsonSerializer.Serialize(playerLeftMessage));
                }

                await NotifyGameOverAsync(sessionId, gameService.Player1Id);
            }
        }
    }

    private async Task NotifyGameOverAsync(string sessionId, string winnerId)
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            var gameManager = scope.ServiceProvider.GetRequiredService<GameManager>();
            var gameService = gameManager.GetOrCreateGame(sessionId);

            var gameOverMessage = new
            {
                action = "gameOver",
                sessionId = sessionId,
                winner = winnerId
            };

            var jsonMessage = JsonSerializer.Serialize(gameOverMessage);
            var buffer = Encoding.UTF8.GetBytes(jsonMessage);

            foreach (var socket in _connectionManager.GetAllConnections())
            {
                if (socket.State == WebSocketState.Open)
                {
                    await socket.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, CancellationToken.None);
                }
            }

            // 🔹 Eliminar la partida después de notificar a los jugadores
            gameManager.RemoveGame(sessionId);
        }
    }

    public async Task LeaveGame(string userId)
    {
        await HandlePlayerExitFromGame(userId, isDisconnection: false);
    }


    public async Task HandlePlayerGameDisconnection(string playerId)
    {
        await HandlePlayerExitFromGame(playerId, isDisconnection: true);
    }

    private async Task SendAsync(WebSocket webSocket, string message)
    {
        byte[] bytes = System.Text.Encoding.UTF8.GetBytes(message);
        await webSocket.SendAsync(bytes, WebSocketMessageType.Text, true, CancellationToken.None);
    }
}