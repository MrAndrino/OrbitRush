'use client';

import { useEffect, useState } from "react";
import { useWebSocket } from "@/context/websocketcontext";
import { useAuth } from "@/context/authcontext";
import GameSession from "@/components/game/gamelayout/gamesession";

interface SessionData {
  sessionId: string;
  player1Id: string;
  player2Id?: string | null;
}

export default function GamePage() {
  const { ws } = useWebSocket();
  const { decodedToken } = useAuth();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);

  useEffect(() => {
    if (!ws || !decodedToken?.id) return;

    const handleGameStart = (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      if (data.Action === "gameStarted") {
        console.log("🎮 Partida iniciada. Datos recibidos:", data);
        setSessionData({
          sessionId: data.SessionId,
          player1Id: data.Player1Id,
          player2Id: data.Player2Id ?? null,
        });
      }
    };

    ws.addEventListener("message", handleGameStart);

    return () => {
      ws.removeEventListener("message", handleGameStart);
    };
  }, [ws, decodedToken?.id]);

  return (
    <div>
      {sessionData ? (
        <GameSession
          sessionId={sessionData.sessionId}
          player1Id={sessionData.player1Id}
          player2Id={sessionData.player2Id}
        />
      ) : (
        <p>Cargando la sesión de juego...</p>
      )}
    </div>
  );
}
