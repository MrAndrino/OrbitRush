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

const BOT_NAME = "Mr. Orbit";
const BOT_IMAGE = "/images/MatchBot.jpeg";

const GameCard = ({ user, className = "", color = "blue" }: GameCardProps) => {
  const isBot = user.name === "BOT";
  const imageUrl = isBot ? BOT_IMAGE : user.image ? `${BASE_URL}/${user.image}` : "/images/OrbitRush-TrashCan.jpg";
  const displayName = isBot ? BOT_NAME : user.name;

  return (
    <div className={`${styles.userInfo} ${styles[color]}`}>
      <img src={imageUrl} alt="" className={`${styles.userImage} ${styles[color]}`} />
      <span>{displayName}</span>
    </div>
  );
};

export default GameCard;