namespace orbitrush.Domain;

public class GameService
{
    public Board Board { get; private set; }

    public GameService()
    {
        Board = new Board();
    }

    // Método para procesar una jugada (por ejemplo, colocar una bolita)
    public void PlayMove(int row, int col)
    {
        if (Board.State == GameState.Laying && Board.Grid[row, col] == CellState.Empty)
        {
            Board.Grid[row, col] = Board.CurrentPlayer;
            Board.State = GameState.WaitingForOrbit;
        }
    }

    // Método para ejecutar la rotación (orbit) y cambiar turno
    public void PerformOrbit()
    {
        if (Board.State == GameState.WaitingForOrbit)
        {
            Board.Orbit();
            var winner = Board.CheckWinner();
            if (winner != CellState.Empty)
            {
                Board.State = GameState.GameOver;
                // Aquí se podría lanzar un evento o almacenar el ganador para notificarlo
            }
            else
            {
                Board.SwitchPlayer();
                Board.State = GameState.Laying;
            }
        }
    }

    // Otros métodos para manejar movimientos o lógicas adicionales pueden ir aquí
}
