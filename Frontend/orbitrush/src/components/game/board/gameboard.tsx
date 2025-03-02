"use client";

import { useWebSocket } from "@/context/websocketcontext";
import { CellState } from "@/types/game";
import { useEffect, useState } from "react";

const GameBoard = () => {
    const { ws, sessionId, board, currentPlayer, gameState, connectWebSocket } = useWebSocket();
    const [localSessionId, setLocalSessionId] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (!ws) {
          console.log("⏳ WebSocket aún no está disponible en GameBoard...");
          connectWebSocket(); 
        } else {
          console.log("✅ WebSocket finalmente disponible en GameBoard:", ws);
          setIsReady(true);
        }
      }, [ws]);

    useEffect(() => {
        const storedSessionId = localStorage.getItem("sessionId");
        if (!sessionId && storedSessionId) {
            console.log("🔄 Restaurando sessionId desde localStorage:", storedSessionId);
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
        console.log("🔄 currentPlayer actualizado en GameBoard.tsx:", currentPlayer);
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
        console.log("🖱️ Click detectado en:", rowIndex, colIndex);
        console.log("📌 Estado completo del tablero:", board);
        console.log("📌 Valor en la celda seleccionada:", board[rowIndex * 4 + colIndex]);

        if (!localSessionId) {
            console.error("❌ No hay una sesión activa.");
            return;
        }

        if (gameState !== "Laying" || board[rowIndex * 4 + colIndex] !== "Empty") {
            console.log(gameState, board[rowIndex][colIndex])
            console.warn("⚠️ Movimiento inválido. No es tu turno o la casilla está ocupada.");
            return;
        }

        console.log("📌 currentPlayer:", currentPlayer);
        console.log("📌 gameState:", gameState);
        console.log("📌 Casilla seleccionada:", board[rowIndex][colIndex]);

        const message = JSON.stringify({
            Action: "playMove",
            Row: rowIndex,
            Col: colIndex,
            SessionId: localSessionId,
        });

        console.log("📤 Intentando enviar movimiento:", message);
        ws.send(message);
    };

    if (!currentPlayer) {
        return <p className="text-white text-lg">Cargando datos del juego...</p>;
    }

    return (
        <div className="flex flex-col items-center gap-4 p-4">
            <h1 className="text-2xl font-bold">🚀 Orbit Rush</h1>
            {localSessionId ? (
                <>
                    <p className="text-lg">{gameState === "GameOver" ? "🛑 Juego terminado" : `Turno de: ${currentPlayer}`}</p>
                    <div className="grid grid-cols-4 gap-2">
                        {board.map((cell: CellState, index: number) => (
                            <div
                                key={index}
                                onClick={() => handleCellClick(Math.floor(index / 4), index % 4)}
                                className={`w-16 h-16 flex items-center justify-center border border-gray-500 text-2xl cursor-pointer ${cell === CellState.Black ? "bg-black text-white" : cell === CellState.White ? "bg-white text-black" : "bg-gray-800"}`}
                            >
                                {cell === CellState.Black ? "⚫" : cell === CellState.White ? "⚪" : ""}
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <p className="text-white text-lg">Cargando partida...</p>
            )}
        </div>
    );
}

export default GameBoard;
