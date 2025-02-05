import React from "react";
import GameCard, { User } from "@/components/miscelaneus/cards/gamecard/gamecard"; 
import styles from "./lobbybox.module.css";

interface LobbyBoxProps {
  users: User[]; 
}

const LobbyBox = ({ users }: LobbyBoxProps) => {
  return (
    <div className={styles.lobbyBox}>
      <GameCard user={users[0]} color="blue" className={styles.playerOne} />
      <img src='images/OrbitRush-Title.png' alt="adsad" />
      <GameCard user={users[1]} color="orange" className={styles.playerTwo} />
    </div>
  );
};

export default LobbyBox;
