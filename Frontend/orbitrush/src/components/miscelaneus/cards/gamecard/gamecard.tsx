import React from "react";
import styles from "./gamecard.module.css";
import { BASE_URL } from "@/config";

export interface User {
  name: string;
  image?: string;
}

interface GameCardProps {
  user: User;
  className?: string;
  color?: "blue" | "orange";
}

const GameCard = ({ user, className = "", color = "blue" }: GameCardProps) => {
  const imageUrl = user.image ? `${BASE_URL}/${user.image}` : "/images/OrbitRush-TrashCan.jpg";

  return (
    <div className={`${styles.userInfo} ${styles[color]}`}>
      <img src={imageUrl} alt="" className={`${styles.userImage} ${styles[color]}`} />
      <span>{user.name}</span>
    </div>
  );
};

export default GameCard;