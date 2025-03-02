import Modal from "@/components/miscelaneus/modal/modal";

interface GameOverModalProps {
  isOpen: boolean;
  onClose: () => void;
  winner: string;
  sessionId: string;
}

const GameOverModal = ({ isOpen, onClose, winner, sessionId }: GameOverModalProps) => {
  const handlePlayAgain = () => {
    console.log("🔄 Jugar otra vez - Session ID:", sessionId);
    onClose();
    // Aquí podríamos enviar una solicitud para una nueva partida si es necesario
  };

  const handleGoToMenu = () => {
    console.log("🏠 Volver al menú");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} closeModal={onClose} color="blue">
      <div style={{ textAlign: "center", padding: "20px" }}>
        <h2>🎉 ¡Partida Finalizada!</h2>
        <p>{winner === "1" ? "¡Ganaste!" : "Has perdido"}</p>
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
