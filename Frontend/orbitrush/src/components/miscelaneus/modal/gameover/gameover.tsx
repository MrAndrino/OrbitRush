import Modal from "@/components/miscelaneus/modal/modal";
import { useRouter } from "next/navigation";

interface GameOverModalProps {
  isOpen: boolean;
  onClose: () => void;
  winner: string;
  sessionId: string;
  userId: string | null;
}

const GameOverModal = ({ isOpen, onClose, winner, sessionId, userId }: GameOverModalProps) => {
  const router = useRouter()
  const isWinner = winner?.toString() === userId?.toString();

  const handlePlayAgain = () => {
    onClose();
  };

  const handleGoToMenu = () => {
    router.push("/menu");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} closeModal={onClose} color="blue">
      <div className="text-center p-5">
        <h2 className="text-xl font-bold text-white">🎉 ¡Partida Finalizada!</h2>
        <p className={`mt-3 text-lg font-semibold ${isWinner ? "text-green-400" : "text-red-400"}`}>
          {winner && userId ? (isWinner ? "¡Ganaste!" : "Has perdido") : "❌ Error: Datos de la partida no disponibles."}
        </p>
        <p className="mt-2 text-gray-300 text-sm">Session ID: {sessionId}</p>
        <div className="flex justify-center gap-4 mt-5">
          <button
            onClick={handlePlayAgain}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition duration-200"
          >
            Jugar otra vez
          </button>
          <button
            onClick={handleGoToMenu}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition duration-200"
          >
            Volver al menú
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default GameOverModal;
