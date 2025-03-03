"use client";

import { useWebSocket } from "@/context/websocketcontext";
import { CellState } from "@/types/game";
import { useEffect, useState } from "react";
import styles from "./gameboard.module.css";

interface GameBoardProps {
    userId: string;
}

const GameBoard: React.FC<GameBoardProps> = ({ userId }) => {
    const { ws, sessionId, board, currentPlayer, gameState, connectWebSocket } =
        useWebSocket();
    const [localSessionId, setLocalSessionId] = useState<string | null>(null);
    const storedPlayer1 = sessionStorage.getItem("player1Id");
    const storedPlayer2 = sessionStorage.getItem("player2Id");
    const isPlayer1 = String(userId) === String(storedPlayer1);
    const isCurrentPlayer = currentPlayer === (isPlayer1 ? "Black" : "White");
    const canHover = isCurrentPlayer && gameState !== "WaitingForOrbit";
    const hoverClass = canHover ? (isPlayer1 ? styles["hover-blue"] : styles["hover-orange"]) : "";
    const isBotGame = storedPlayer2?.startsWith("BOT_");

    //LOGS DE DEBUG PARA DETECTAR PROBLEMAS
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
        console.log("📡 Datos actualizados:");
        console.log("🆔 Session ID:", sessionId ?? "⏳ Aún no disponible");
        console.log("🛠️ Board:", board.length > 0 ? board : "⏳ Aún no disponible");
        console.log("🎯 Current Player:", currentPlayer ?? "⏳ Aún no disponible");
        console.log("📢 Game State:", gameState ?? "⏳ Aún no disponible");
    }, [sessionId, board, currentPlayer, gameState]);

    useEffect(() => {
        if (isBotGame && currentPlayer === "White") {
            console.log("🤖 Esperando jugada del bot...");
        }
    }, [currentPlayer, isBotGame]);

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
            (window as any).ws = ws;
            console.log("🌍 WebSocket almacenado en window:", (window as any).ws);
        } else {
            console.warn("⚠ WebSocket no está disponible todavía.");
        }
    }, [ws]);

    useEffect(() => {
        const storedSessionId = sessionStorage.getItem("sessionId");
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

    //MANEJO DE CLIC EN CELDA 
    const handleCellClick = (rowIndex: number, colIndex: number) => {
        console.log("📊 Board antes del clic:", board);

        if (!board || !Array.isArray(board) || board.length !== 4 || !Array.isArray(board[0])) {
            console.error("❌ El tablero no está correctamente inicializado:", board);
            return;
        }

        const cellValue = board[rowIndex][colIndex];

        if (!localSessionId) {
            console.error("❌ No hay una sesión activa.");
            return;
        }

        if (isBotGame && (currentPlayer !== "Black" || gameState !== "Laying")) {
            console.warn("⚠️ No es tu turno en partida contra el bot.");
            return;
        }

        if (!isBotGame && gameState !== "Laying") {
            console.warn("⚠️ Movimiento inválido en partida normal.");
            return;
        }

        if (cellValue !== 0) {
            console.warn("⚠️ Casilla ocupada.");
            return;
        }

        const message = JSON.stringify({
            Action: "playMove",
            Row: rowIndex,
            Col: colIndex,
            SessionId: localSessionId,
        });

        console.log("📤 Enviando mensaje WebSocket:", message);
        ws.send(message);
    };

    //🔄 MANEJO DE ORBIT
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

    // VERIFICACIÓN DE SINCRONIZACIÓN DE TURNOS
    useEffect(() => {
        console.log(`🔄 Turno actualizado: ${currentPlayer} | Estado: ${gameState}`);
    }, [currentPlayer, gameState]);

    if (!currentPlayer) {
        return <p className="text-white text-lg">Cargando datos del juego...</p>;
    }

    return (
        <div className={styles.container}>
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
                                                : `${styles.empty} ${hoverClass}`
                                            }`}
                                    >
                                        {cell === CellState.Black ? "🔵" : cell === CellState.White ? "🟠" : ""}
                                    </div>
                                ))
                            )
                        ) : (
                            <p className={styles.loadingText}>Cargando tablero...</p>
                        )}
                        <button
                            onClick={handleOrbit}
                            className={`${styles.orbitButton} ${gameState === "WaitingForOrbit" &&
                                ((currentPlayer === "Black" && userId === storedPlayer1) ||
                                    (currentPlayer === "White" && userId === storedPlayer2))
                                ? styles.orbitActive
                                : styles.orbitDisabled
                                }`}
                            disabled={
                                gameState !== "WaitingForOrbit" ||
                                !(
                                    (currentPlayer === "Black" && userId === storedPlayer1) ||
                                    (currentPlayer === "White" && userId === storedPlayer2)
                                )
                            }
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