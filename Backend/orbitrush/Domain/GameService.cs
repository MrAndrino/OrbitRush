using orbitrush.Database;
using orbitrush.Database.Entities;
using orbitrush.Database.Entities.Enums;
using orbitrush.Database.Repositories;
using System.Diagnostics;

namespace orbitrush.Domain;
public class GameService
{
    private readonly UnitOfWork _unitOfWork;
    private readonly Stopwatch _stopwatch;

    public string CurrentSessionId { get; set; }
    public Board Board { get; private set; }
    public string Player1Id { get; set; }
    public string Player2Id { get; set; }
    public GameState State { get; set; }
    public CellState Player1Piece { get; set; }
    public CellState Player2Piece { get; set; }

    public GameService(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
        Board = new Board();
        State = GameState.Laying;
        _stopwatch = new Stopwatch();
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
                return "No es el momento de jugar una ficha.";

            if (row < 0 || row >= 4 || col < 0 || col >= 4)
                return "Movimiento fuera de los límites del tablero.";

            if (Board.Grid[row, col] != CellState.Empty)
                return "Casilla ocupada.";

            var currentPlayerPiece = (playerId == Player1Id) ? Player1Piece : Player2Piece;

            if (Board.CurrentPlayer != currentPlayerPiece)
                return "No es tu turno.";

            Board.Grid[row, col] = currentPlayerPiece;
            State = GameState.WaitingForOrbit;

            return "Movimiento realizado con éxito.";
        }
        catch (Exception ex)
        {
            return $"Error inesperado: {ex.Message}";
        }
    }

    public async Task PerformOrbit()
    {
        if (State != GameState.WaitingForOrbit)
            throw new InvalidOperationException("No es el momento de girar el tablero.");

        Board.Orbit();
        var winner = Board.CheckWinner();

        if (winner != CellState.Empty)
        {
            State = GameState.GameOver;
            await SaveMatchData(winner);
            return;
        }

        if (IsBoardFull())
        {
            int maxRotations = 5;
            int rotationCount = 0;

            while (rotationCount < maxRotations)
            {
                System.Threading.Tasks.Task.Delay(2500).Wait();
                Board.Orbit();
                winner = Board.CheckWinner();

                if (winner != CellState.Empty)
                {
                    State = GameState.GameOver;
                    await SaveMatchData(winner);
                    return;
                }

                rotationCount++;
            }

            State = GameState.GameOver;
            await SaveMatchData(CellState.Empty);
            return;
        }

        Board.SwitchPlayer();
        State = GameState.Laying;
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
        _stopwatch.Stop();

        var match = new Match
        {
            MatchDate = DateTime.UtcNow,
            Duration = _stopwatch.Elapsed
        };

        await _unitOfWork.MatchRepository.InsertAsync(match);
        await _unitOfWork.SaveAsync();

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

        await _unitOfWork.MatchResultRepository.InsertRangeAsync(results);
        await _unitOfWork.SaveAsync();
    }
}