"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/authcontext";
import { useUsers } from "@/context/userscontext";
import GameBoard from "@/components/game/board/gameboard";
import ChatBox from "@/components/game/chatbox/chatbox";
import { BASE_URL } from "@/config";
import styles from "./gamelayout.module.css";
import Button from "@/components/miscelaneus/button/button";
import { BookOpen, LogOut } from "lucide-react";
import Modal from "@/components/miscelaneus/modal/modal";
import Instructions from "@/components/miscelaneus/instructions/instructions";

interface UserProfile {
    id: number;
    name: string;
    image?: string;
}

const GameLayout = () => {
    const { decodedToken } = useAuth();
    const { getUserProfileData } = useUsers();

    const [player1, setPlayer1] = useState<UserProfile | null>(null);
    const [player2, setPlayer2] = useState<UserProfile | null>(null);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    useEffect(() => {
        const fetchPlayers = async () => {
            const player1Id = sessionStorage.getItem("player1Id");
            const player2Id = sessionStorage.getItem("player2Id");

            console.log("Player1 ID:", player1Id);
            console.log("Player2 ID:", player2Id);

            if (player1Id) {
                const profile1 = await getUserProfileData(player1Id);
                console.log("Player1 Profile:", profile1);
                if (profile1) setPlayer1(profile1);
            }
            if (player2Id) {
                const profile2 = await getUserProfileData(player2Id);
                console.log("Player2 Profile:", profile2);
                if (profile2) setPlayer2(profile2);
            }
        };

        fetchPlayers();
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.leftSide}>
                <div className={styles.buttons}>
                    <Button color="red" className="h-12 w-16 text-xl flex items-center justify-center">
                        <LogOut />
                    </Button>
                    <Button onClick={openModal} color="blue" className="h-12 w-16 text-xl flex items-center justify-center">
                        <BookOpen />
                    </Button>
                </div>
                {player1 && (
                    <div className={styles.userInfo1}>
                        <img
                            src={player1?.image ? `${BASE_URL}/${player1.image}` : "/default-avatar.png"}
                            alt={player1?.name || "Player 1"}
                            className={styles.avatar1}
                        />
                        <h2 className={styles.playerName}>{player1.name}</h2>
                    </div>
                )}
            </div>
            {/* Juego */}
            <GameBoard userId={decodedToken.id.toString()} />
            <div className={styles.rightSide}>
                {player2 && (
                    <div className={styles.userInfo2}>
                        <img
                            src={player2?.image ? `${BASE_URL}/${player2.image}` : "/default-avatar.png"}
                            alt={player2?.name || "Player 2"}
                            className={styles.avatar2}
                        />
                        <h2 className={styles.playerName}>{player2.name}</h2>
                    </div>
                )}
                {/* Chat */}
                <ChatBox />
            </div>

            <Modal isOpen={isModalOpen} closeModal={closeModal} color="blue" className="w-[55%]">
                <Instructions />
            </Modal>
        </div>
    );
};

export default GameLayout;
