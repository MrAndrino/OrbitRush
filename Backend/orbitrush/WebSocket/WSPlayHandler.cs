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
    }

    public async Task ProcessPlayMessageAsync(string userId, string message)
    {
        try
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var _gameService = scope.ServiceProvider.GetRequiredService<GameService>();
                var playMessage = JsonSerializer.Deserialize<PlayMessage>(message);
                if (playMessage != null)
                {
                    switch (playMessage.Action)
                    {
                        case "playMove":
                            _gameService.PlayMove(playMessage.Row, playMessage.Col);
                            await BroadcastGameStateAsync();
                            break;
                        case "orbit":
                            _gameService.PerformOrbit();
                            await BroadcastGameStateAsync();
                            if (_gameService.Board.State == GameState.GameOver)
                            {
                                await NotifyGameOverAsync();
                            }
                            break;
                        // Puedes agregar más acciones según sea necesario
                        default:
                            break;
                    }
                }
            }
        }
        catch (JsonException)
        {
            throw new InvalidOperationException("Formato de mensaje inválido");
        }
    }

    // Método para notificar el estado actual del juego a todos los jugadores
    private async Task BroadcastGameStateAsync()
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            var _gameService = scope.ServiceProvider.GetRequiredService<GameService>();

            var gameState = new
            {
                action = "gameState",
                board = _gameService.Board.Grid,
                currentPlayer = _gameService.Board.CurrentPlayer.ToString(),
                state = _gameService.Board.State.ToString()
            };

            var jsonMessage = JsonSerializer.Serialize(gameState);
            var buffer = Encoding.UTF8.GetBytes(jsonMessage);

            // Enviar a todos los sockets conectados (asumiendo que WSConnectionManager tiene este método)
            foreach (var socket in _connectionManager.GetAllConnections())
            {
                if (socket.State == WebSocketState.Open)
                {
                    await socket.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, CancellationToken.None);
                }
            }
        }
    }

    // Notificar a los jugadores que la partida terminó y quién es el ganador
    private async Task NotifyGameOverAsync()
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            var _gameService = scope.ServiceProvider.GetRequiredService<GameService>();
            var winner = _gameService.Board.CheckWinner();
            var gameOverMessage = new
            {
                action = "gameOver",
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