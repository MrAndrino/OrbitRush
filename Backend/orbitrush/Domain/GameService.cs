namespace orbitrush.Domain;
public class GameService
{
    public string CurrentSessionId { get; private set; }
    public Board Board { get; private set; }
    public string Player1Id { get; private set; }
    public string Player2Id { get; private set; }
    public GameState State { get; private set; } // 🔹 Manejamos el estado del juego

    public GameService()
    {
        Board = new Board();
        State = GameState.Laying; // 🔹 Estado inicial
    }

    public void InitializeGame(string player1Id, string player2Id, string sessionId)
    {
        Player1Id = player1Id;
        Player2Id = player2Id;
        CurrentSessionId = sessionId;
        Board.Initialize();
        State = GameState.Laying;
    }

    public void PlayMove(int row, int col)
    {
        if (State != GameState.Laying)
            throw new InvalidOperationException("No es el momento de jugar una ficha.");

        if (Board.Grid[row, col] != CellState.Empty)
            throw new InvalidOperationException("Casilla ocupada.");

        Board.Grid[row, col] = Board.CurrentPlayer;
        State = GameState.WaitingForOrbit; // 🔹 Ahora el turno espera la órbita
    }

    public void PerformOrbit()
    {
        if (State != GameState.WaitingForOrbit)
            throw new InvalidOperationException("No es el momento de girar el tablero.");

        Board.Orbit();
        var winner = Board.CheckWinner();

        if (winner != CellState.Empty)
        {
            State = GameState.GameOver;
            return; // 🔹 Termina el juego si hay ganador después del primer giro normal
        }

        // 🔹 Si el tablero está lleno y no hay ganador, activamos los giros extra (máximo 5)
        if (IsBoardFull())
        {
            int maxRotations = 5; // 🔹 Máximo de 5 giros adicionales
            int rotationCount = 0;

            while (rotationCount < maxRotations)
            {
                Board.Orbit();
                winner = Board.CheckWinner();

                if (winner != CellState.Empty)
                {
                    State = GameState.GameOver;
                    return; // 🔹 Termina el juego si hay ganador después de una rotación extra
                }

                rotationCount++;
            }

            // 🔹 Si después de 5 giros aún no hay ganador, se considera empate
            State = GameState.GameOver;
            return;
        }

        // 🔹 Si el tablero NO está lleno, el juego continúa normalmente
        Board.SwitchPlayer();
        State = GameState.Laying;
    }

    // 🔹 `IsBoardFull()` ahora está en `GameService`
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
}