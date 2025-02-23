'use client'

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWebSocket } from "@/context/websocketcontext";
import Modal from "@/components/miscelaneus/modal/modal";
import Button from "@/components/miscelaneus/button/button";

interface MatchFoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: string;
  opponentId: string;
  sendResponse: (matchId: string, response: "accept" | "reject") => void;
}

const MatchFoundModal = ({
  isOpen,
  onClose,
  matchId,
  opponentId,
  sendResponse,
}: MatchFoundModalProps) => {
  const [countdown, setCountdown] = useState<number>(7);
  const [statusMessage, setStatusMessage] = useState<string>("¡Partida encontrada!");
  const [buttonsVisible, setButtonsVisible] = useState<boolean>(true);
  const [contentMessage, setContentMessage] = useState<string>("¡Se ha encontrado un rival! ¿Deseas jugar?");

  const { matchData, cancelMatchmaking, setIsSearching, leaveLobby } = useWebSocket();
  const router = useRouter();
  const autoCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setCountdown(7);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev > 1) return prev - 1;
        clearInterval(timer);
        return 0;
      });
    }, 1000);

    if (matchData?.gameStarted) {
      onClose();
      router.push("/menu/lobby");
    }

    autoCloseTimeoutRef.current = setTimeout(() => {
      cancelMatchmaking();
      setIsSearching(false);
      leaveLobby();
      onClose();
    }, 7000);

    return () => {
      clearInterval(timer);
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
        autoCloseTimeoutRef.current = null;
      }
    };
  }, [isOpen, matchData]);

  const handleAccept = () => {
    setStatusMessage("Partida Aceptada");
    setContentMessage("Esperando a rival...");
    setButtonsVisible(false);
    sendResponse(matchId, "accept");
    if (autoCloseTimeoutRef.current) {
      clearTimeout(autoCloseTimeoutRef.current);
      autoCloseTimeoutRef.current = null;
    }
  };

  const handleReject = () => {
    setStatusMessage("Partida Rechazada");
    setContentMessage("Volviendo al menú...");
    setButtonsVisible(false);
    sendResponse(matchId, "reject");
    if (autoCloseTimeoutRef.current) {
      clearTimeout(autoCloseTimeoutRef.current);
      autoCloseTimeoutRef.current = null;
    }
    setIsSearching(false);
    leaveLobby();
    setTimeout(() => {
      onClose();
    }, countdown * 1000);
  };

  return (
    <Modal
      color="orange"
      isOpen={isOpen}
      closeModal={onClose}
      className="w-[40%] flex items-center justify-center"
    >
      <div className="flex flex-col gap-[1rem] items-center justify-center">
        <h2 className="text-5xl">{statusMessage}</h2>
        <p className="pb-[1rem] text-xl">{contentMessage}</p>
        {buttonsVisible && (
          <div className="flex gap-[2rem]">
            <Button color="orange" onClick={handleAccept} className="w-[7rem] h-[3rem] text-2xl">Aceptar</Button>
            <Button color="red" onClick={handleReject} className="w-[7rem] h-[3rem] text-2xl">Rechazar</Button>
          </div>
        )}
        <p className="">Tiempo restante: {countdown}s</p>
      </div>
    </Modal>
  );
};

export default MatchFoundModal;