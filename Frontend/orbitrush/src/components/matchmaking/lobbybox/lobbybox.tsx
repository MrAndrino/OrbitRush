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
  lobbyId?: string;
  player1Id: string;
  player2Id?: string | null;
}

const LobbyBox = ({ lobbyId, player1Id, player2Id }: LobbyBoxProps) => {
  const { getUserProfileData, userProfile } = useUsers();
  const { ws, leaveLobby, startGame } = useWebSocket();
  const { decodedToken } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const currentUserId = decodedToken?.id?.toString();
  const isPlayer1 = currentUserId === player1Id;
  const isPlayer2Bot = player2Id?.startsWith("BOT_") || false;
  const hasPlayer2 = !!player2Id;

  const [players, setPlayers] = useState<User[]>([
    { name: "Esperando...", image: "/images/OrbitRush-TrashCan.jpg" },
    { name: "Esperando...", image: "/images/OrbitRush-TrashCan.jpg" },
  ]);

  console.log(`🔍 Usuario actual: ${currentUserId}, Player1: ${player1Id}, Player2: ${player2Id}`);

  useEffect(() => {
    if (player1Id && !player1Id.startsWith("BOT_")) getUserProfileData(player1Id);
    if (player2Id && !player2Id.startsWith("BOT_")) getUserProfileData(player2Id);
  }, [player1Id, player2Id]);

  useEffect(() => {
    if (player1Id && !player1Id.startsWith("BOT_"))
      getUserProfileData(player1Id);
    if (player2Id && !player2Id.startsWith("BOT_"))
      getUserProfileData(player2Id);
  }, [player1Id, player2Id]);
  useEffect(() => {
    if (!ws) return;

    const handleLobbyUpdate = (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      if (data.Action === "lobbyUpdated" && data.LobbyId === lobbyId) {
        console.log(":loudspeaker: Lobby actualizado:", data);

        setPlayers([
          {
            name: data.Player1Name,
            image: data.Player1Image,
          },
          data.Player2Id?.startsWith("BOT_")
            ? { name: "BOT", image: "/images/MatchBot.jpeg" }
            : data.Player2Id
              ? { name: data.Player2Name, image: data.Player2Image }
              : { name: "Esperando...", image: "/images/OrbitRush-TrashCan.jpg" },
        ]);
      }

      if (data.Action === "opponentDisconnected") {
        console.log(
          ":arrows_counterclockwise: Oponente desconectado. Ahora el usuario actual es el anfitrión."
        );

        setPlayers((prev) => [
          prev[0],
          { name: "Esperando...", image: "/images/OrbitRush-TrashCan.jpg" },
        ]);
      }

      if (data.Action === "returnToLobby") {
        console.log(":arrows_counterclockwise: Oponente ha salido. Actualizando lobby...");

        setPlayers((prev) => [
          prev[0],
          { name: "Esperando...", image: "/images/OrbitRush-TrashCan.jpg" },
        ]);
      }
    };

    ws.addEventListener("message", handleLobbyUpdate);

    return () => {
      ws.removeEventListener("message", handleLobbyUpdate);
    };
  }, [ws, lobbyId]);

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
        <div className="flex gap-8 font-center">
          <Button onClick={openModal} color="blue" className="h-12 w-16 text-xl flex items-center justify-center">
            <BookOpen />
          </Button>
          <Button onClick={leaveLobby} color="red" className="h-12 w-16 text-xl flex items-center justify-center">
            <LogOut />
          </Button>
        </div>
        <GameCard user={players[0]} color="blue" />
      </div>

      <img src="/images/vs2.png" alt="VS" className={styles.image} />

      <div className={styles.side}>
        <GameCard user={hasPlayer2 ? (isPlayer2Bot ? { name: "BOT", image: "/images/MatchBot.jpeg" } : players[1]) : { name: "Esperando...", image: "/images/OrbitRush-TrashCan.jpg" }}
          color="orange" />
        <Button
          color={isPlayer1 && hasPlayer2 ? "orange" : "disabled"}
          className="h-12 w-44 text-xl"
          onClick={isPlayer1 && hasPlayer2 ? startGame : undefined}
        >
          {isPlayer1 ? "Empezar partida" : "Esperando al Host"}
        </Button>
      </div>

      <Modal isOpen={isModalOpen} closeModal={closeModal} color="blue" className="w-[55%]">
        <Instructions />
      </Modal>
    </div>
  );
};

export default LobbyBox;
