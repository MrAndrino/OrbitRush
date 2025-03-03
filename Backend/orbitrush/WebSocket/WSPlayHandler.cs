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
            Console.WriteLine("Mensaje recibido en ProcessPlayMessageAsync:");
            Console.WriteLine($"userId: {userId}");
            Console.WriteLine($"Mensaje crudo: {message}");

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

                        await Task.Delay(500);

                        if (gameService.Board.CurrentPlayer == CellState.White && gameService.Player2Id.StartsWith("BOT_"))
                        {
                            Console.WriteLine("Turno del bot después de órbita. Ejecutando su jugada...");
                            var bot = new BotOrbito(gameService.Player2Id, _connectionManager, _serviceProvider);
                            await bot.PlayTurnAsync(playMessage.SessionId);
                        }

                        break;


                    case "leaveGame":
                        await LeaveGame(userId);
                        break;

                    default:
                        responseMessage = "Error: Acción no válida.";
                        break;
                }

                if (!string.IsNullOrEmpty(responseMessage))
                {
                    await SendMessageToPlayerAsync(userId, responseMessage);
                }
            }
        }
        catch (JsonException)
        {
            var errorMessage = new
            {
                Action = "error",
                Message = "Formato de mensaje inválido."
            };
            await SendMessageToPlayerAsync(userId, JsonSerializer.Serialize(errorMessage));
        }
        catch (InvalidOperationException ex)
        {
            var errorMessage = new
            {
                Action = "error",
                Message = ex.Message
            };
            await SendMessageToPlayerAsync(userId, JsonSerializer.Serialize(errorMessage));
        }
        catch (Exception ex)
        {
            var errorMessage = new
            {
                Action = "error",
                Message = "Error inesperado: " + ex.Message
            };
            await SendMessageToPlayerAsync(userId, JsonSerializer.Serialize(errorMessage));
        }
    }

    public async Task BroadcastGameStateAsync(string sessionId)
    {
        Console.WriteLine($"Enviando estado del juego para SessionId: {sessionId}");

        using (var scope = _serviceProvider.CreateScope())
        {
            var gameManager = scope.ServiceProvider.GetRequiredService<GameManager>();
            var gameService = gameManager.GetOrCreateGame(sessionId);
            if (gameService == null) return;

            var boardState = new CellState[16];
            for (int i = 0; i < 4; i++)
            {
                for (int j = 0; j < 4; j++)
                {
                    boardState[i * 4 + j] = gameService.Board.Grid[i, j];
                }
            }

            for (int i = 0; i < 4; i++)
            {
                Console.WriteLine($"{gameService.Board.Grid[i, 0]}, {gameService.Board.Grid[i, 1]}, {gameService.Board.Grid[i, 2]}, {gameService.Board.Grid[i, 3]}");
            }

            var gameState = new
            {
                Action = "gameState",
                SessionId = sessionId,
                Board = boardState,
                CurrentPlayer = gameService.Board.CurrentPlayer.ToString(),
                State = gameService.State.ToString()
            };

            var jsonMessage = JsonSerializer.Serialize(gameState);
            Console.WriteLine($"Estado enviado al frontend: {jsonMessage}");

            var buffer = Encoding.UTF8.GetBytes(jsonMessage);

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

    private async Task SendMessageToPlayerAsync(string userId, string response)
    {
        var socket = _connectionManager.GetConnectionById(userId);
        if (socket != null && socket.State == WebSocketState.Open)
        {
            var buffer = Encoding.UTF8.GetBytes(response);
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

            if (!string.IsNullOrEmpty(gameService.Player2Id) && gameService.Player2Id.StartsWith("BOT_"))
            {
                await gameManager.RemoveGame(sessionId);
                return;
            }

            gameService.State = GameState.GameOver;

            if (gameService.Player1Id == playerId)
            {
                if (!string.IsNullOrEmpty(opponentId))
                {
                    await gameService.SaveMatchData(gameService.Player2Piece);

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
            }
            else
            {
                await gameService.SaveMatchData(gameService.Player1Piece);

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

            await gameManager.RemoveGame(sessionId);
        }
    }

    public async Task NotifyGameOverAsync(string sessionId, string winnerId)
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

            var gameOverMessage = new
            {
                Action = "gameOver",
                SessionId = sessionId,
                Winner = winnerId
            };

            var jsonMessage = JsonSerializer.Serialize(gameOverMessage);
            var buffer = Encoding.UTF8.GetBytes(jsonMessage);

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