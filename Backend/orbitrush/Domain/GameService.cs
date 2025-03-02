using orbitrush.Database.Entities;
using orbitrush.Database.Entities.Enums;
using orbitrush.Database.Repositories;
using System.Diagnostics;
using System.Text.Json;

namespace orbitrush.Domain;
public class GameService
{

    private readonly Stopwatch _stopwatch;
    private readonly IServiceProvider _serviceProvider;

    public string CurrentSessionId { get; set; }
    public Board Board { get; private set; }
    public string Player1Id { get; set; }
    public string Player2Id { get; set; }
    public GameState State { get; set; }
    public CellState Player1Piece { get; set; }
    public CellState Player2Piece { get; set; }

    public GameService(IServiceProvider serviceProvider)
    {
        Board = new Board();
        State = GameState.Laying;
        _stopwatch = new Stopwatch();
        _serviceProvider = serviceProvider;
    }

    public void InitializeGame(string player1Id, string player2Id, string sessionId)
    {
        Player1Id = player1Id;
        Player2Id = player2Id;
        CurrentSessionId = sessionId;
        Board.Initialize();
        Player1Piece = CellState.Black;
        Player2Piece = CellState.White;
        State = GameState.Laying;
        _stopwatch.Restart();
    }

    public string PlayMove(string playerId, int row, int col)
    {
        try
        {
            if (State != GameState.Laying)
                return JsonSerializer.Serialize(new
                {
                    Action = "error",
                    Message = "No es el momento de jugar una ficha."
                });

            if (row < 0 || row >= 4 || col < 0 || col >= 4)
                return JsonSerializer.Serialize(new
                {
                    Action = "error",
                    Message = "Movimiento fuera de los límites del tablero."
                });

            if (Board.Grid[row, col] != CellState.Empty)
                return JsonSerializer.Serialize(new
                {
                    Action = "error",
                    Message = "Casilla ocupada."
                });

            var currentPlayerPiece = (playerId == Player1Id) ? Player1Piece : Player2Piece;

            if (Board.CurrentPlayer != currentPlayerPiece)
                return JsonSerializer.Serialize(new
                {
                    Action = "error",
                    Message = "No es tu turno."
                });

            Board.Grid[row, col] = currentPlayerPiece;
            State = GameState.WaitingForOrbit;

            return JsonSerializer.Serialize(new
            {
                Action = "moveConfirmed",
                Message = "Movimiento realizado con éxito."
            });
        }
        catch (Exception ex)
        {
            return JsonSerializer.Serialize(new
            {
                Action = "error",
                Message = $"Error inesperado: {ex.Message}"
            });
        }
    }

    public async Task PerformOrbit()
    {
        if (State != GameState.WaitingForOrbit)
            throw new InvalidOperationException("No es el momento de girar el tablero.");

        using var scope = _serviceProvider.CreateScope();
        var wsPlayHandler = scope.ServiceProvider.GetRequiredService<WSPlayHandler>();

        Board.Orbit();
        await wsPlayHandler.BroadcastGameStateAsync(CurrentSessionId);

        var winner = Board.CheckWinner();
        if (winner != CellState.Empty)
        {
            State = GameState.GameOver;
            await SaveMatchData(winner);
            await wsPlayHandler.BroadcastGameStateAsync(CurrentSessionId);
            return;
        }

        // 🔹 Si el tablero NO está lleno, simplemente cambia el turno
        if (!IsBoardFull())
        {
            Board.SwitchPlayer();
            State = GameState.Laying;
            await wsPlayHandler.BroadcastGameStateAsync(CurrentSessionId);
            return;
        }

        // 🔹 Si el tablero ESTÁ lleno, hace los 5 giros
        int maxRotations = 5;
        int rotationCount = 0;

        while (rotationCount < maxRotations)
        {
            await Task.Delay(1000);
            Board.Orbit();
            await wsPlayHandler.BroadcastGameStateAsync(CurrentSessionId);

            winner = Board.CheckWinner();
            if (winner != CellState.Empty)
            {
                State = GameState.GameOver;
                await SaveMatchData(winner);
                await wsPlayHandler.BroadcastGameStateAsync(CurrentSessionId);
                return;
            }

            rotationCount++;
        }

        // 🔹 Si después de los giros sigue sin haber ganador, se declara empate
        State = GameState.GameOver;
        await SaveMatchData(CellState.Empty);
        await wsPlayHandler.BroadcastGameStateAsync(CurrentSessionId);
    }


    private bool IsBoardFull()
    {
        for (int i = 0; i < 4; i++)
        {
            for (int j = 0; j < 4; j++)
            {
                if (Board.Grid[i, j] == CellState.Empty)
                    return false;
            }
        }
        return true;
    }

    public async Task SaveMatchData(CellState winner)
    {

        if (Player2Id.StartsWith("BOT_"))
        {
            Console.WriteLine("🤖 [INFO] Partida contra un bot no se guardará en la base de datos.");
            return;
        }

        _stopwatch.Stop();
        using var scope = _serviceProvider.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<UnitOfWork>();

        var match = new Match
        {
            MatchDate = DateTime.UtcNow,
            Duration = _stopwatch.Elapsed
        };

        await unitOfWork.MatchRepository.InsertAsync(match);
        await unitOfWork.SaveAsync();


        var results = new List<MatchResult>();

        if (winner == CellState.Empty)
        {
            results.Add(new MatchResult { MatchId = match.Id, UserId = int.Parse(Player1Id), Result = MatchResultEnum.Draw });
            results.Add(new MatchResult { MatchId = match.Id, UserId = int.Parse(Player2Id), Result = MatchResultEnum.Draw });
        }
        else
        {
            var winnerId = (winner == Player1Piece) ? int.Parse(Player1Id) : int.Parse(Player2Id);
            var loserId = (winner == Player1Piece) ? int.Parse(Player2Id) : int.Parse(Player1Id);

            results.Add(new MatchResult { MatchId = match.Id, UserId = winnerId, Result = MatchResultEnum.Victory });
            results.Add(new MatchResult { MatchId = match.Id, UserId = loserId, Result = MatchResultEnum.Defeat });
        }

        await unitOfWork.MatchResultRepository.InsertRangeAsync(results);
        await unitOfWork.SaveAsync();
    }
}