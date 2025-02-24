namespace orbitrush.Domain;

public enum CellState { Empty, Black, White }
public enum GameState { Laying, WaitingForOrbit, ChooseMoving, Moving, GameOver }


public class Board
{
    public CellState[,] Grid { get; private set; }
    public CellState CurrentPlayer { get; private set; }
    public GameState State { get; set; }


    // Coordenadas para la rotación (cadena externa e interna)
    private readonly (int row, int col)[] outerChain = new (int, int)[]
    {
        (0,0), (1,0), (2,0), (3,0),
        (3,1), (3,2), (3,3),
        (2,3), (1,3), (0,3),
        (0,2), (0,1), (0,0)
    };

    private readonly (int row, int col)[] innerChain = new (int, int)[]
    {
        (1,1), (2,1), (2,2), (1,2), (1,1)
    };


    public Board()
    {
        Grid = new CellState[4, 4];
        for (int i = 0; i < 4; i++)
        {
            for (int j = 0; j < 4; j++)
            {
                Grid[i, j] = CellState.Empty;
            }
        }
        CurrentPlayer = CellState.Black;
        State = GameState.Laying;
    }

    public void SwitchPlayer()
    {
        CurrentPlayer = (CurrentPlayer == CellState.Black) ? CellState.White : CellState.Black;
    }

    public CellState CheckWinner()
    {
        var winner = CheckRows();
        if (winner != CellState.Empty) return winner;
        winner = CheckColumns();
        if (winner != CellState.Empty) return winner;
        winner = CheckDiagonals();
        return winner;
    }

    private CellState CheckRows()
    {
        for (int i = 0; i < 4; i++)
        {
            if (Grid[i, 0] != CellState.Empty &&
                Grid[i, 0] == Grid[i, 1] &&
                Grid[i, 1] == Grid[i, 2] &&
                Grid[i, 2] == Grid[i, 3])
                return Grid[i, 0];
        }
        return CellState.Empty;
    }

    private CellState CheckColumns()
    {
        for (int j = 0; j < 4; j++)
        {
            if (Grid[0, j] != CellState.Empty &&
                Grid[0, j] == Grid[1, j] &&
                Grid[1, j] == Grid[2, j] &&
                Grid[2, j] == Grid[3, j])
                return Grid[0, j];
        }
        return CellState.Empty;
    }

    private CellState CheckDiagonals()
    {
        if (Grid[0, 0] != CellState.Empty &&
            Grid[0, 0] == Grid[1, 1] &&
            Grid[1, 1] == Grid[2, 2] &&
            Grid[2, 2] == Grid[3, 3])
            return Grid[0, 0];

        if (Grid[0, 3] != CellState.Empty &&
            Grid[0, 3] == Grid[1, 2] &&
            Grid[1, 2] == Grid[2, 1] &&
            Grid[2, 1] == Grid[3, 0])
            return Grid[0, 3];

        return CellState.Empty;
    }

    public void Orbit()
    {
        var newGrid = (CellState[,])Grid.Clone();

        // Rotación de la cadena externa
        for (int i = 1; i < outerChain.Length; i++)
        {
            var (row, col) = outerChain[i];
            var (prevRow, prevCol) = outerChain[i - 1];
            newGrid[row, col] = Grid[prevRow, prevCol];
        }

        // Rotación de la cadena interna
        for (int i = 1; i < innerChain.Length; i++)
        {
            var (row, col) = innerChain[i];
            var (prevRow, prevCol) = innerChain[i - 1];
            newGrid[row, col] = Grid[prevRow, prevCol];
        }

        Grid = newGrid;
    }
}