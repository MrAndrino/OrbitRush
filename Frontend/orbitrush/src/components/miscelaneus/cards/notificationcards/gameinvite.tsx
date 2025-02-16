import React from "react";
import styles from "./notificationcard.module.css";
import { useWebSocket } from "@/context/websocketcontext";

export interface GameNotification {
  id: number;
  sender: string;
  senderId: string;
}

interface GameNotificationProps {
  notification: GameNotification;
}

const GameNotificationCard: React.FC<GameNotificationProps> = ({ notification }) => {
  const { respondToGameRequest } = useWebSocket();

  return (
    <div className={styles.notificationCard}>
      <span className={styles.notificationUser}>{notification.sender}</span>
      <span className={styles.notificationMessage}>te ha invitado a jugar</span>
      <div className={styles.buttonContainer}>
        <button className={styles.acceptButton} onClick={() => respondToGameRequest(notification.senderId, "accept")}>
          Aceptar
        </button>
        <button className={styles.rejectButton} onClick={() => respondToGameRequest(notification.senderId, "reject")}>
          Rechazar
        </button>
      </div>
    </div>
  );
};

export default GameNotificationCard;
