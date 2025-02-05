import React from "react";
import styles from "./matchbox.module.css";
import Button from "@/components/miscelaneus/button/button";

interface MatchBoxProps {
  variant: "bot" | "random" | "friend";
}

const MatchBox = ({ variant }: MatchBoxProps) => {
  const images = {
    bot: "/images/MatchBot.jpeg",
    random: "/images/MatchRandom.jpeg",
    friend: "/images/MatchCustom.jpeg",
  };

  const handleClick = () => {
    switch (variant) {
      case "bot":
        console.log("Iniciando partida contra un bot...");
        break;
      case "random":
        console.log("Buscando partida aleatoria...");
        break;
      case "friend":
        console.log("Jugando con un amigo...");
        break;
      default:
        console.warn("Variante no reconocida");
    }
  };

  return (
    <section className={styles.matchbox}>
      <img src={images[variant]} alt={variant} className={styles.icon} />
      {variant === "bot" &&
        <div className={styles.matchcontent}>
          <div>
            <p className={styles.matchTitle}>Vs Bot</p>
            <p className={styles.matchText}>Pon a prueba tus habilidades contra una inteligencia artificial. Perfecto para practicar estrategias sin presión y mejorar antes de enfrentarte a otros jugadores.</p></div>
          <Button color="orange" onClick={handleClick} className="w-[7rem] h-[3rem] text-3xl">Jugar</Button>
        </div>}
      {variant === "random" &&
        <div className={styles.matchcontent}>
          <div>
            <p className={styles.matchTitle}>Partida Rápida</p>
            <p className={styles.matchText}>Salta directo a la acción y enfréntate a un jugador aleatorio en cuestión de segundos. ¡Demuestra de qué estás hecho!</p></div>
          <Button color="orange" onClick={handleClick} className="w-[7rem] h-[3rem] text-3xl">Jugar</Button>
        </div>}
      {variant === "friend" &&
        <div className={styles.matchcontent}>
          <div>
            <p className={styles.matchTitle}>Crear Partida</p>
            <p className={styles.matchText}>Crea una partida privada y reta a un amigo en un duelo personalizado. Solo uno podrá llevarse la victoria, ¿quién demostrará ser el mejor?</p></div>
          <Button color="orange" href={"/menu/matchmaking/lobby"} className="w-[7rem] h-[3rem] text-3xl">Jugar</Button>
        </div>}
    </section>
  );
};

export default MatchBox;
