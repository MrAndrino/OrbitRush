using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

namespace orbitrush.Domain;

public class BotOrbito
{
    private readonly string _botId;
    private readonly WSConnectionManager _connectionManager;
    private readonly IServiceProvider _serviceProvider;

    public BotOrbito(string botId, WSConnectionManager connectionManager, IServiceProvider serviceProvider)
    {
        _botId = botId;
        _connectionManager = connectionManager;
        _serviceProvider = serviceProvider;
    }

    public async Task PlayTurnAsync(string sessionId)
    {
        Console.WriteLine($"[BOT] INTENTANDO JUGAR en la sesión {sessionId}");

        using (var scope = _serviceProvider.CreateScope())
        {
            var gameManager = scope.ServiceProvider.GetRequiredService<GameManager>();
            var gameService = gameManager.GetOrCreateGame(sessionId);
            var playHandler = scope.ServiceProvider.GetRequiredService<WSPlayHandler>();

            if (gameService == null || gameService.State == GameState.GameOver)
            {
                Console.WriteLine($"[BOT] No se encontró la partida o ya ha terminado.");
                return;
            }

            if (gameService.Board.CurrentPlayer != CellState.White)
            {
                Console.WriteLine($"[BOT] No es mi turno.");
                return;
            }

            (int row, int col)? move = GetBestMove(gameService.Board);
            if (move == null)
            {
                Console.WriteLine($"[BOT] No hay movimientos disponibles.");
                return;
            }

            int selectedRow = move.Value.row;
            int selectedCol = move.Value.col;

            gameService.Board.Grid[selectedRow, selectedCol] = CellState.White;
            gameService.State = GameState.WaitingForOrbit;
            await playHandler.BroadcastGameStateAsync(sessionId);

            await Task.Delay(500);

            await gameService.PerformOrbit();

            await playHandler.BroadcastGameStateAsync(sessionId);
        }
    }

    private (int row, int col)? GetBestMove(Board board)
    {
        Random random = new Random();
        var emptyCells = Enumerable.Range(0, 4)
            .SelectMany(row => Enumerable.Range(0, 4)
            .Where(col => board.Grid[row, col] == CellState.Empty)
            .Select(col => (row, col)))
            .ToList();

        if (emptyCells.Count == 0) return null;

        return emptyCells[random.Next(emptyCells.Count)];
    }
}