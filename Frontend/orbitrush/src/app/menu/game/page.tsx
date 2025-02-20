'use client';

import { useEffect, useState } from "react";
import LobbyBox from "@/components/matchmaking/lobbybox/lobbybox";
import { useWebSocket } from "@/context/websocketcontext";

interface LobbyData {
  player1Id: string;
  player2Id: string;
}

export default function GamePage() {
  const { ws } = useWebSocket();
  const [lobby, setLobby] = useState<LobbyData | null>(null);

  useEffect(() => {
    const lobbyId = localStorage.getItem("lobbyId");
    if (!lobbyId || !ws) return;

    const requestLobbyInfo = () => {
      ws.send(JSON.stringify({ Action: "getLobbyInfo", TargetId: lobbyId }));
    };

    const handleMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      if (message.Action === "lobbyUpdated") {
        setLobby({
          player1Id: message.Player1Id,
          player2Id: message.Player2Id,
        });
      }
    };

    ws.addEventListener("message", handleMessage);
    requestLobbyInfo();

    return () => {
      ws.removeEventListener("message", handleMessage);
    };
  }, [ws]);

  return (
    <section className="text-center w-[100%]">
      {lobby ? <LobbyBox player1Id={lobby.player1Id} player2Id={lobby.player2Id} /> : <p>Cargando lobby...</p>}
    </section>
  );
}
