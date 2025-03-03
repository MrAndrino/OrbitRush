import Modal from "@/components/miscelaneus/modal/modal";
import { useRouter } from "next/navigation";

interface GameOverModalProps {
  isOpen: boolean;
  onClose: () => void;
  winner: string;
  sessionId: string;
  userId: string | null; // 🔥 Nuevo: userId se pasa desde WebSocketProvider
}

const GameOverModal = ({ isOpen, onClose, winner, sessionId, userId }: GameOverModalProps) => {
  const router = useRouter();

  const handlePlayAgain = () => {
    console.log("🔄 Jugar otra vez - Session ID:", sessionId);
    onClose();
  };

  const handleGoToMenu = () => {
    console.log("🏠 Volver al menú");
    router.push("/menu");
    onClose();
  };

  console.log("🆔 userId recibido en GameOverModal:", userId);
  console.log("🏆 winner recibido en GameOverModal:", winner);


  return (
    <Modal isOpen={isOpen} closeModal={onClose} color="blue">
      <div style={{ textAlign: "center", padding: "20px" }}>
        <h2>🎉 ¡Partida Finalizada!</h2>
        <p>{winner === userId ? "¡Ganaste!" : "Has perdido"}</p>
        <p>Session ID: {sessionId}</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "20px" }}>
          <button onClick={handlePlayAgain} style={{ padding: "10px", background: "green", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
            Jugar otra vez
          </button>
          <button onClick={handleGoToMenu} style={{ padding: "10px", background: "red", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
            Volver al menú
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default GameOverModal;
