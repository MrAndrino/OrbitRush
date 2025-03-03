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
import { useWebSocket } from "@/context/websocketcontext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface UserProfile {
    id: number;
    name: string;
    image?: string;
}

interface GameLayoutProps {
    userId: string;
}

const BOT_NAME = "Botorbito";
const BOT_IMAGE = "/images/MatchBot.jpeg";

const GameLayout: React.FC<GameLayoutProps> = ({ userId }) => {
    const { logout } = useAuth();
    const { getUserProfileData } = useUsers();
    const { currentPlayer, leaveGame } = useWebSocket();
    const router = useRouter();

    const [player1, setPlayer1] = useState<UserProfile | null>(null);
    const [player2, setPlayer2] = useState<UserProfile | null>(null);

    const [timer, setTimer] = useState<number>(60);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);
    const openLogoutModal = () => setIsLogoutModalOpen(true);
    const closeLogoutModal = () => setIsLogoutModalOpen(false);

    const player1Id = sessionStorage.getItem("player1Id");
    const player2Id = sessionStorage.getItem("player2Id");

    useEffect(() => {
        const fetchPlayers = async () => {
            console.log("Player1 ID:", player1Id);
            console.log("Player2 ID:", player2Id);

            if (player1Id) {
                const profile1 = await getUserProfileData(player1Id);
                console.log("Player1 Profile:", profile1);
                if (profile1) setPlayer1(profile1);
            }
            if (player2Id && !player2Id.startsWith("BOT_")) {
                const profile2 = await getUserProfileData(player2Id);
                console.log("Player2 Profile:", profile2);
                if (profile2) {
                    setPlayer2(profile2);
                } else {
                    setPlayer2({ id: 0, name: BOT_NAME, image: BOT_IMAGE });
                }
            } else {
                console.log("Asignando bot por defecto en lugar de hacer una solicitud");
                setPlayer2({ id: 0, name: BOT_NAME, image: BOT_IMAGE });
            }
        };

        fetchPlayers();
    }, []);


    useEffect(() => {
        setTimer(60);

        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    leaveGame();

                    console.log("⏳ Tiempo agotado. Evaluando qué hacer...");

                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [currentPlayer, userId, player1Id, player2Id]);

    useEffect(() => {
        if (timer === 0) {
            router.push("/menu");
        }
    }, [timer]);

    useEffect(() => {
        if (timer === 0) {
            if (userId === player1Id && currentPlayer === "Black") {
                console.log("🚪 El jugador Black (usuario actual) se fue. Haciendo logout...");
                logout();
            } else if (userId === player2Id && currentPlayer === "White") {
                console.log("🚪 El jugador White (usuario actual) se fue. Haciendo logout...");
                logout();
            }
        }
    }, [timer]);

    const handleSurrender = () => {
        leaveGame();
        closeLogoutModal();
        router.push("/menu");
        toast.custom(
            <div
                style={{
                    backgroundColor: "var(--backgroundtoast)",
                    color: "var(--foreground)",
                    fontSize: "16px",
                    borderRadius: "8px",
                    padding: "10px 20px",
                    border: "2px solid rgba(255, 140, 0)",
                    boxShadow:
                        "0 0 10px rgba(255, 140, 0, 1), 0 0 15px rgba(255, 140, 0, 0.6)",
                }}
            >
                Has abandonado partida
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.leftSide}>
                <div className={styles.buttons}>
                    <Button onClick={openModal} color="blue" className="h-12 w-16 text-xl flex items-center justify-center">
                        <BookOpen />
                    </Button>
                    <Button onClick={openLogoutModal} color="red" className="h-12 w-16 text-xl flex items-center justify-center">
                        <LogOut />
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
                        {currentPlayer === "Black" && <p className={`${styles.timer} ${timer < 10 ? styles.timerRed : ""}`}>
                            {timer}s
                        </p>}
                    </div>
                )}
            </div>

            {/* Juego */}
            <GameBoard userId={userId} />

            <div className={styles.rightSide}>
                {player2 && (
                    <div className={styles.userInfo2}>
                        <img
                            src={player2?.image ? `${BASE_URL}/${player2.image}` : "/default-avatar.png"}
                            alt={player2?.name || "Player 2"}
                            className={styles.avatar2}
                        />
                        <h2 className={styles.playerName}>{player2.name}</h2>
                        {currentPlayer === "White" && <p className={`${styles.timer} ${timer < 10 ? styles.timerRed : ""}`}>
                            {timer}s
                        </p>}
                    </div>
                )}
                {/* Chat */}
                <ChatBox />
            </div>

            <Modal isOpen={isModalOpen} closeModal={closeModal} color="blue" className="w-[55%]">
                <Instructions />
            </Modal>

            <Modal isOpen={isLogoutModalOpen} closeModal={closeLogoutModal} color="red" className="w-[40%] text-center">

                <div className="flex flex-col gap-12">
                    <p className="text-3xl">¿Seguro que quieres salir del juego?</p>
                    <p className="text-lg">Esto le dará la victoria al rival.</p>
                    <div className="flex justify-center gap-4">
                        <Button onClick={handleSurrender} color="red" className="w-[10rem] h-[4rem] text-2xl">
                            Rendirse
                        </Button>
                        <Button onClick={closeLogoutModal} color="blue" className="w-[10rem] h-[4rem] text-2xl">
                            Cancelar
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default GameLayout;
