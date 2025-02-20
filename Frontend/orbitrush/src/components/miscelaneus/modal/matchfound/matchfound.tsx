import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWebSocket } from "@/context/websocketcontext";  // 🔹 Importar WebSocketContext
import Modal from "@/components/miscelaneus/modal/modal";
import Button from "@/components/miscelaneus/button/button";

interface MatchFoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: string;
  opponentId: string;
  sendResponse: (matchId: string, response: "accept" | "reject") => void;
}

const MatchFoundModal = ({ isOpen, onClose, matchId, opponentId, sendResponse }: MatchFoundModalProps) => {
  const [countdown, setCountdown] = useState<number>(7);
  const [statusMessage, setStatusMessage] = useState<string>("¡Partida encontrada!");
  const [buttonsVisible, setButtonsVisible] = useState<boolean>(true);
  const { matchData } = useWebSocket();  // 🔹 Obtener matchData del contexto
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return;
  
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
  
    if (matchData?.gameStarted) {
      onClose();
      router.push("/menu/lobby");
    }
  
    const closeTimeout = setTimeout(() => {
      onClose();
    }, 7000);
  
    return () => {
      clearInterval(timer);
      clearTimeout(closeTimeout);
    };
  }, [isOpen, matchData]);
  
  const handleAccept = () => {
    setStatusMessage("Partida aceptada, esperando rival...");
    setButtonsVisible(false);
    sendResponse(matchId, "accept");
  };

  const handleReject = () => {
    setStatusMessage("Has rechazado la partida, volviendo al menú...");
    setButtonsVisible(false);
    sendResponse(matchId, "reject");
  };

  return (
    <Modal color="orange" isOpen={isOpen} closeModal={onClose}>
      <div>
        <h2>{statusMessage}</h2>
        {countdown > 0 && <p>Tiempo restante: {countdown}s</p>}
        {buttonsVisible && (
          <div>
            <Button color="orange" onClick={handleAccept}>
              Aceptar
            </Button>
            <Button color="red" onClick={handleReject}>
              Rechazar
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default MatchFoundModal;
