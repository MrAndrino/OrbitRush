import React, { useEffect, useState } from "react";
import GameCard, { User } from "@/components/miscelaneus/cards/gamecard/gamecard";
import styles from "@/components/matchmaking/lobbybox/lobbybox.module.css";
import { useUsers } from "@/context/userscontext";
import { useWebSocket } from "@/context/websocketcontext";
import { useAuth } from "@/context/authcontext";

interface GameSessionProps {
  sessionId: string;
  player1Id: string;
  player2Id?: string | null;
}

const GameSession = ({ sessionId, player1Id, player2Id }: GameSessionProps) => {
  const { getUserProfileData, userProfile } = useUsers();
  const { ws } = useWebSocket();
  const { decodedToken } = useAuth();
  const currentUserId = decodedToken?.id?.toString();

  const [players, setPlayers] = useState<User[]>([
    { name: "Cargando...", image: "/images/OrbitRush-TrashCan.jpg" },
    { name: "Cargando...", image: "/images/OrbitRush-TrashCan.jpg" },
  ]);

  // Verificar si Player2 es un bot
  const isPlayer2Bot = player2Id?.startsWith("BOT_") || false;
  const hasPlayer2 = !!player2Id;

  useEffect(() => {
    if (player1Id && !player1Id.startsWith("BOT_")) getUserProfileData(player1Id);
    if (player2Id && !player2Id.startsWith("BOT_")) getUserProfileData(player2Id);
  }, [player1Id, player2Id]);

  useEffect(() => {
    if (!ws) return;

    const handleSessionUpdate = (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      if (data.Action === "gameSessionUpdated" && data.SessionId === sessionId) {
        console.log("📢 Datos de la sesión de juego actualizados:", data);

        setPlayers([
          { name: data.Player1Name, image: data.Player1Image },
          data.Player2Id?.startsWith("BOT_")
            ? { name: "BOT", image: "/images/MatchBot.jpeg" }
            : data.Player2Id
              ? { name: data.Player2Name, image: data.Player2Image }
              : { name: "Esperando...", image: "/images/OrbitRush-TrashCan.jpg" },
        ]);
      }
    };

    ws.addEventListener("message", handleSessionUpdate);

    return () => {
      ws.removeEventListener("message", handleSessionUpdate);
    };
  }, [ws, sessionId]);

  useEffect(() => {
    if (userProfile) {
      setPlayers((prev) => [
        userProfile.id.toString() === player1Id
          ? { name: userProfile.name, image: userProfile.image || "/images/OrbitRush-TrashCan.jpg" }
          : prev[0],

        hasPlayer2 && userProfile.id.toString() === player2Id
          ? { name: userProfile.name, image: userProfile.image || "/images/OrbitRush-TrashCan.jpg" }
          : prev[1],
      ]);
    }
  }, [userProfile]);

  return (
    <div className={styles.lobbyBox}>
      <div className={styles.side}>
        <GameCard user={players[0]} color="blue" />
      </div>

      <img src="/images/vs2.png" alt="VS" className={styles.image} />

      <div className={styles.side}>
        <GameCard 
          user={hasPlayer2 ? (isPlayer2Bot ? { name: "BOT", image: "/images/MatchBot.jpeg" } : players[1]) : { name: "Esperando...", image: "/images/OrbitRush-TrashCan.jpg" }}
          color="orange" 
        />
      </div>
    </div>
  );
};

export default GameSession;
