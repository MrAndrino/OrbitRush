"use client";

import { useWebSocket } from "@/context/websocketcontext";
import { CellState } from "@/types/game";
import { useEffect, useState } from "react";

const GameBoard = () => {
    const { ws, sessionId, board, currentPlayer, gameState, connectWebSocket } = useWebSocket();
    const [localSessionId, setLocalSessionId] = useState<string | null>(null);

    useEffect(() => {
        console.log("🔄 Verificando actualización de sessionId en el contexto:", sessionId);
    }, [sessionId]);

    useEffect(() => {
        const storedSessionId = localStorage.getItem("sessionId");
        if (!sessionId && storedSessionId) {
            console.log("🔄 Restaurando sessionId desde localStorage:", storedSessionId);
            setLocalSessionId(storedSessionId);
        }
    }, [sessionId]);


    // 🔥 Manejo de clic en celda
    const handleCellClick = (rowIndex: number, colIndex: number) => {
        console.log("🖱️ Click detectado en:", rowIndex, colIndex);

        if (!ws) {
            console.error("❌ WebSocket es null.");
            return;
        }

        console.log("🔍 Estado actual del WebSocket:", ws.readyState);
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.error("❌ WebSocket no está conectado.");
            return;
        }

        if (!localSessionId) {
            console.error("❌ No hay una sesión activa.");
            return;
        }

        if (gameState !== "Laying" || board[rowIndex][colIndex] !== "Empty") {
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

    return (
        <div className="flex flex-col items-center gap-4 p-4">
            <h1 className="text-2xl font-bold">🚀 Orbit Rush</h1>
            {localSessionId ? (
                <>
                    <p className="text-lg">{gameState === "GameOver" ? "🛑 Juego terminado" : `Turno de: ${currentPlayer}`}</p>
                    <div className="grid grid-cols-4 gap-2">
                        {board.map((row: CellState[], rowIndex: number) =>
                            row.map((cell: CellState, colIndex: number) => (
                                <div
                                    key={`${rowIndex}-${colIndex}`}
                                    onClick={() => handleCellClick(rowIndex, colIndex)}
                                    className={`w-16 h-16 flex items-center justify-center border border-gray-500 text-2xl cursor-pointer ${cell === "Black" ? "bg-black text-white" : cell === "White" ? "bg-white text-black" : "bg-gray-800"
                                        }`}
                                >
                                    {cell === "Black" ? "⚫" : cell === "White" ? "⚪" : ""}
                                </div>
                            ))
                        )}
                    </div>
                </>
            ) : (
                <p className="text-white text-lg">Cargando partida...</p>
            )}
        </div>
    );
}

export default GameBoard;
