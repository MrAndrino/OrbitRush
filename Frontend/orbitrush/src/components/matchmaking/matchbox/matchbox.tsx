'useclient'

import React from "react";
import styles from "./matchbox.module.css";
import Button from "@/components/miscelaneus/button/button";
import { useWebSocket } from "@/context/websocketcontext";
import toast from "react-hot-toast";

interface MatchBoxProps {
  variant: "bot" | "random" | "friend";
  isSearching: boolean;
}

const MatchBox = ({ variant, isSearching }: MatchBoxProps) => {
  const { playWithBot, queueForMatch, cancelMatchmaking } = useWebSocket();
  
  const images = {
    bot: "/images/MatchBot.jpeg",
    random: "/images/MatchRandom.jpeg",
    friend: "/images/MatchCustom.jpeg",
  };

  const handlePlayBot = () => {
    playWithBot();
  };

  const handleClick = () => {
    if (variant === "random") {
      if (isSearching) {
        cancelMatchmaking();
        toast.error("Has salido del Matchmaking")
      } else {
        queueForMatch();
      }
    }
  };

  return (
    <section className={styles.matchbox}>
      <img src={images[variant]} alt={variant} className={styles.icon} />
      {variant === "bot" && (
        <div className={styles.matchcontent}>
          <div>
            <p className={styles.matchTitle}>Vs Bot</p>
            <p className={styles.matchText}>
              Pon a prueba tus habilidades contra una inteligencia artificial.
              Perfecto para practicar estrategias sin presión y mejorar antes de enfrentarte a otros jugadores.
            </p>
          </div>
          <Button color={isSearching ? "disabled" : "orange"} onClick={isSearching ? undefined : handlePlayBot} className="w-[7rem] h-[3rem] text-3xl">
            Jugar
          </Button>
        </div>
      )}
      {variant === "random" && (
        <div className={styles.matchcontent}>
          <div>
            <p className={styles.matchTitle}>Partida Rápida</p>
            <p className={styles.matchText}>
              Salta directo a la acción y enfréntate a un jugador aleatorio en cuestión de segundos. ¡Demuestra de qué estás hecho!
            </p>
          </div>
          <Button
            color={isSearching ? "red" : "orange"}
            onClick={handleClick}
            className={isSearching ? "w-[7rem] h-[3rem] text-2xl" : "w-[7rem] h-[3rem] text-3xl"}
          >
            {isSearching ? "Cancelar" : "Jugar"}
          </Button>
        </div>
      )}
      {variant === "friend" &&
        <div className={styles.matchcontent}>
          <div>
            <p className={styles.matchTitle}>Crear Partida</p>
            <p className={styles.matchText}>Crea una partida privada y reta a un amigo en un duelo personalizado. Solo uno podrá llevarse la victoria, ¿quién demostrará ser el mejor?</p></div>
          <p>Invita a un amigo para empezar.</p>
        </div>}
    </section>
  );
};

export default MatchBox;
