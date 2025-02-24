using orbitrush.Domain;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

namespace orbitrush.WebSocket;

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

                switch (playMessage.Action)
                {
                    case "playMove":
                        gameService.PlayMove(playMessage.Row, playMessage.Col);
                        await BroadcastGameStateAsync(playMessage.SessionId);
                        break;

                    case "orbit":
                        gameService.PerformOrbit();
                        await BroadcastGameStateAsync(playMessage.SessionId);
                        if (gameService.State == GameState.GameOver)
                        {
                            await NotifyGameOverAsync(playMessage.SessionId);
                        }
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
}