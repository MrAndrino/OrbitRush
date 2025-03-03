import Modal from "@/components/miscelaneus/modal/modal";
import Button from "../../button/button";
import { useWebSocket } from "@/context/websocketcontext";

interface GameOverModalProps {
  isOpen: boolean;
  onClose: () => void;
  winner: string;
  sessionId: string;
  userId: string | null;
}

const GameOverModal = ({ isOpen, onClose, winner, userId }: GameOverModalProps) => {
  const isWinner = winner?.toString() === userId?.toString();
  const { queueForMatch } = useWebSocket();

  const handlePlayAgain = () => {
    queueForMatch();
    onClose();
  };

  const handleGoToMenu = () => {
    onClose();
  };

  return (
    <Modal isOpen={isOpen} closeModal={onClose} color="blue">
      <div className="text-center flex flex-col gap-8">
        <p className={`text-5xl font-semibold ${isWinner ? "text-green-400" : "text-red-400"}`}>
          {winner && userId ? (isWinner ? "¡Ganaste!" : "Has perdido") : "❌ Error: Datos de la partida no disponibles."}
        </p>
        <p className="text-lg">¿Deseas jugar otra partida?</p>

        <div className="flex justify-center gap-[2rem] select-none">
          <Button color="blue" onClick={handlePlayAgain} className="w-36 h-12 text-xl" >Jugar otra vez</Button>
          <Button color="red" onClick={handleGoToMenu} className="w-36 h-12 text-xl">Volver al menú</Button>
        </div>
      </div>
    </Modal>
  );
};

export default GameOverModal;
