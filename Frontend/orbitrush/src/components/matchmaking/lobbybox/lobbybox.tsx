import React, { useEffect, useState } from "react";
import GameCard, { User } from "@/components/miscelaneus/cards/gamecard/gamecard";
import styles from "./lobbybox.module.css";
import Button from "@/components/miscelaneus/button/button";
import { BookOpen, LogOut } from "lucide-react";
import Modal from "@/components/miscelaneus/modal/modal";
import Instructions from "@/components/miscelaneus/instructions/instructions";
import { useUsers } from "@/context/userscontext";
import { useWebSocket } from "@/context/websocketcontext";
import { useAuth } from "@/context/authcontext";

interface LobbyBoxProps {
  lobbyId: string;
  player1Id: string;
  player2Id: string;
}

const LobbyBox = ({ lobbyId, player1Id, player2Id }: LobbyBoxProps) => {
  const { getUserProfileData, userProfile } = useUsers();
  const { ws } = useWebSocket();
  const { decodedToken } = useAuth();

  const [players, setPlayers] = useState<User[]>([
    { name: "Esperando...", image: "/images/OrbitRush-TrashCan.jpg" },
    { name: "Esperando...", image: "/images/OrbitRush-TrashCan.jpg" },
  ]);

  const currentUserId = decodedToken?.id?.toString();
  const isPlayer1 = currentUserId === player1Id;

  console.log(`🔍 Usuario actual: ${currentUserId}, Player1: ${player1Id}, Player2: ${player2Id}`);

  // 🔹 Obtener datos de los jugadores al montar el componente
  useEffect(() => {
    if (player1Id && !player1Id.startsWith("BOT_")) getUserProfileData(player1Id);
    if (player2Id && !player2Id.startsWith("BOT_")) getUserProfileData(player2Id);
  }, [player1Id, player2Id]);

  // 🔹 Escuchar eventos WebSocket para actualizar el lobby en tiempo real
  useEffect(() => {
    if (!ws) return;

    const handleLobbyUpdate = (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      if (data.Action === "lobbyUpdated" && data.LobbyId === lobbyId) {
        console.log("📢 Lobby actualizado:", data);

        setPlayers([
          {
            name: data.Player1Name,
            image: data.Player1Image,
          },
          data.Player2Id?.startsWith("BOT_")
            ? { name: "BOT", image: "/images/MatchBot.jpeg" } // 🔥 Asegurar que el bot se muestre bien
            : {
                name: data.Player2Name,
                image: data.Player2Image,
              },
        ]);
      }
    };

    ws.addEventListener("message", handleLobbyUpdate);

    return () => {
      ws.removeEventListener("message", handleLobbyUpdate);
    };
  }, [ws, lobbyId]);

  // 🔹 Actualizar perfil cuando cambia `userProfile`
  useEffect(() => {
    if (userProfile) {
      setPlayers((prev) => [
        userProfile.id.toString() === player1Id
          ? { name: userProfile.name, image: userProfile.image || "/images/OrbitRush-TrashCan.jpg" }
          : prev[0],

        userProfile.id.toString() === player2Id
          ? { name: userProfile.name, image: userProfile.image || "/images/OrbitRush-TrashCan.jpg" }
          : prev[1],
      ]);
    }
  }, [userProfile]);

  // 🔹 Función para iniciar la partida
  const startGame = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error("❌ WebSocket no conectado");
      return;
    }
    ws.send(JSON.stringify({ Action: "startGame", LobbyId: lobbyId }));
    console.log("🟢 Partida iniciada");
  };

  return (
    <div className={styles.lobbyBox}>
      <div className={styles.side}>
        <div className="flex gap-8 font-center">
          <Button color="blue" className="h-12 w-16 text-xl flex items-center justify-center">
            <BookOpen />
          </Button>
          <Button color="red" className="h-12 w-16 text-xl flex items-center justify-center">
            <LogOut />
          </Button>
        </div>
        <GameCard user={players[0]} color="blue" />
      </div>

      <img src="/images/vs2.png" alt="VS" className={styles.image} />

      <div className={styles.side}>
        {/* 🔥 Si el segundo jugador es un bot, pasamos "BOT" para que GameCard lo maneje correctamente */}
        <GameCard user={player2Id.startsWith("BOT_") ? { name: "BOT" } : players[1]} color="orange" />
        <Button
          color={isPlayer1 ? "orange" : "disabled"}
          className="h-12 w-44 text-xl"
          onClick={isPlayer1 ? startGame : undefined}
        >
          {isPlayer1 ? "Empezar partida" : "Esperando al Host"}
        </Button>
      </div>

      <Modal isOpen={false} closeModal={() => {}} color="blue" className="w-[55%]">
        <Instructions />
      </Modal>
    </div>
  );
};

export default LobbyBox;
