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
  player1Id: string;
  player2Id: string;
}

const LobbyBox = ({ player1Id, player2Id }: LobbyBoxProps) => {
  const { getUserProfileData, userProfile } = useUsers();
  const { ws } = useWebSocket();
  const { decodedToken } = useAuth(); // 🔥 Obtenemos el ID del usuario autenticado
  const [players, setPlayers] = useState<User[]>([
    { name: "Esperando...", image: "/images/OrbitRush-TrashCan.jpg" },
    { name: "Esperando...", image: "/images/OrbitRush-TrashCan.jpg" },
  ]);

  // 🔍 ID del usuario autenticado
  const currentUserId = decodedToken?.id?.toString();
  console.log(`🔍 Usuario actual: ${currentUserId}, Player1: ${player1Id}, Player2: ${player2Id}`);

  // Determinar si el usuario actual es Player 1
  const isPlayer1 = currentUserId === player1Id;

  useEffect(() => {
    getUserProfileData(player1Id);
    getUserProfileData(player2Id);
  }, [player1Id, player2Id]);

  useEffect(() => {
    if (userProfile) {
      if (userProfile.id.toString() === player1Id) {
        setPlayers((prev) => [
          { name: userProfile.name, image: userProfile.image || "/images/OrbitRush-TrashCan.jpg" },
          prev[1],
        ]);
      } else if (userProfile.id.toString() === player2Id) {
        setPlayers((prev) => [
          prev[0],
          { name: userProfile.name, image: userProfile.image || "/images/OrbitRush-TrashCan.jpg" },
        ]);
      }
    }
  }, [userProfile]);

  // Función para iniciar la partida
  const startGame = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error("❌ WebSocket no conectado");
      return;
    }
    ws.send(JSON.stringify({ Action: "startGame", LobbyId: player1Id }));
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

      <img src='/images/vs2.png' alt="VS" className={styles.image} />

      <div className={styles.side}>
        <GameCard user={players[1]} color="orange" />
        <Button 
          color={isPlayer1 ? "orange" : "disabled"} 
          className="h-12 w-44 text-xl"
          onClick={isPlayer1 ? startGame : undefined}
        >
          {isPlayer1 ? "Empezar partida" : "Esperando al Host"}
        </Button>
      </div>

      {/* Modal */}
      <Modal isOpen={false} closeModal={() => {}} color='blue' className='w-[55%]'>
        <Instructions />
      </Modal>
    </div>
  );
};

export default LobbyBox;
