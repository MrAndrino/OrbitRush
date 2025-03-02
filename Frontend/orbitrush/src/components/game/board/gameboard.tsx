"use client";

import { useWebSocket } from "@/context/websocketcontext";
import { CellState } from "@/types/game";
import { useEffect, useState } from "react";
import styles from "./gameboard.module.css";

interface Window {
    ws: WebSocket;
}

interface GameBoardProps {
    userId: string;
}

const GameBoard: React.FC<GameBoardProps> = ({ userId }) => {
    const { ws, sessionId, board, currentPlayer, gameState, connectWebSocket } =
        useWebSocket();
    const [localSessionId, setLocalSessionId] = useState<string | null>(null);

    useEffect(() => {
        if (!ws) {
            console.log("🎭 Conectando WebSocket con userId:", userId);
            connectWebSocket(userId);
        } else {
            console.log("✅ WebSocket disponible en GameBoard:", ws.url);
        }
    }, [ws]);

    useEffect(() => {
        console.log("🔍 Valor de ws antes de asignar a window:", ws);

        if (ws) {
            console.log("✅ WebSocket disponible:", ws.url);
            (window as any).ws = ws; // Forzar la asignación sin errores de TypeScript
            console.log("🌍 WebSocket almacenado en window:", (window as any).ws);
        } else {
            console.warn("⚠ WebSocket no está disponible todavía.");
        }
    }, [ws]);

    useEffect(() => {
        const storedSessionId = localStorage.getItem("sessionId");
        if (!sessionId && storedSessionId) {
            console.log(
                "🔄 Restaurando sessionId desde localStorage:",
                storedSessionId
            );
            setLocalSessionId(storedSessionId);
        }
    }, [sessionId]);

    useEffect(() => {
        console.log("📊 Tablero en GameBoard actualizado:", board);
    }, [board]);

    useEffect(() => {
        console.log("🎯 Jugador actual en GameBoard:", currentPlayer);
    }, [currentPlayer]);

    useEffect(() => {
        console.log("📢 Estado del juego en GameBoard:", gameState);
    }, [gameState]);

    useEffect(() => {
        console.log(
            "🔄 currentPlayer actualizado en GameBoard.tsx:",
            currentPlayer
        );
    }, [currentPlayer]);

    useEffect(() => {
        console.log("📡 Datos actualizados:");
        console.log("🆔 Session ID:", sessionId ?? "⏳ Aún no disponible");
        console.log("🛠️ Board:", board.length > 0 ? board : "⏳ Aún no disponible");
        console.log("🎯 Current Player:", currentPlayer ?? "⏳ Aún no disponible");
        console.log("📢 Game State:", gameState ?? "⏳ Aún no disponible");
    }, [sessionId, board, currentPlayer, gameState]);

    // 🔥 Manejo de clic en celda
    const handleCellClick = (rowIndex: number, colIndex: number) => {
        console.log("📊 Board antes del clic:", board);

        if (
            !board ||
            !Array.isArray(board) ||
            board.length !== 4 ||
            !Array.isArray(board[0])
        ) {
            console.error("❌ El tablero no está correctamente inicializado:", board);
            return;
        }

        const cellValue = board[rowIndex][colIndex];

        console.log(
            "📌 Valor en la celda seleccionada:",
            rowIndex,
            colIndex,
            "->",
            cellValue ?? "⛔ Error: Valor indefinido"
        );

        if (!localSessionId) {
            console.error("❌ No hay una sesión activa.");
            return;
        }

        if (gameState !== "Laying" || cellValue !== 0) {
            console.warn(
                "⚠️ Movimiento inválido. No es tu turno o la casilla está ocupada."
            );
            return;
        }

        // 📡 Enviar el mensaje de movimiento al backend
        const message = JSON.stringify({
            Action: "playMove",
            Row: rowIndex,
            Col: colIndex,
            SessionId: localSessionId,
        });

        console.log("📤 Enviando mensaje WebSocket:", message);
        ws.send(message);
    };

    const handleOrbit = () => {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.error("❌ WebSocket no disponible.");
            return;
        }

        if (!localSessionId) {
            console.error("❌ No hay una sesión activa.");
            return;
        }

        const orbitMessage = JSON.stringify({
            Action: "orbit",
            SessionId: localSessionId,
        });

        console.log("📤 Enviando solicitud de Orbit:", orbitMessage);
        ws.send(orbitMessage);
    };

    if (!currentPlayer) {
        return <p className="text-white text-lg">Cargando datos del juego...</p>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>🚀 Orbit Rush</h1>
            {localSessionId ? (
                <>
                    <p className={styles.currentTurn}>
                        {gameState === "GameOver" ? "🛑 Juego terminado" : `Turno de: ${currentPlayer}`}
                    </p>

                    <div className={styles.board}>
                        {Array.isArray(board) && board.length === 4 ? (
                            board.map((row, rowIndex) =>
                                row.map((cell: CellState, colIndex: number) => (
                                    <div
                                        key={`${rowIndex}-${colIndex}`}
                                        onClick={() => handleCellClick(rowIndex, colIndex)}
                                        className={`${styles.cell} ${cell === CellState.Black
                                            ? styles.black
                                            : cell === CellState.White
                                                ? styles.white
                                                : styles.empty
                                            }`}
                                    >
                                        {cell === CellState.Black ? "⚫" : cell === CellState.White ? "⚪" : ""}
                                    </div>
                                ))
                            )
                        ) : (
                            <p className={styles.loadingText}>Cargando tablero...</p>
                        )}
                        <button
                            onClick={handleOrbit}
                            className={`${styles.orbitButton} ${gameState === "WaitingForOrbit" && sessionStorage.getItem("currentPlayer") === currentPlayer
                                ? styles.orbitActive
                                : styles.orbitDisabled
                                }`}
                            disabled={gameState !== "WaitingForOrbit" || sessionStorage.getItem("currentPlayer") !== currentPlayer}
                        >
                            <img src="/icons/icon-512x512.png" alt="" />
                        </button>
                    </div>
                </>
            ) : (
                <p className={styles.loadingText}>Cargando partida...</p>
            )}
        </div>
    );
};

export default GameBoard;