import React from "react";
import styles from "./notificationcard.module.css";

export interface GameNotification {
  id: number;
  sender: string;
}

interface GameNotificationProps {
  notification: GameNotification;
  onAcceptGame: (id: number) => void;
  onRefuseGame: (id: number) => void;
}

const GameNotificationCard = ({
  notification,
  onAcceptGame,
  onRefuseGame,
}: GameNotificationProps) => {
  const handleAccept = () => {
    onAcceptGame(notification.id);
  };

  const handleRefuse = () => {
    onRefuseGame(notification.id);
  };

  return (
    <div className={styles.notificationCard}>
      <span className={styles.notificationMessage}>
        {notification.sender} ha invitado a jugar
      </span>
      <div className={styles.buttonContainer}>
        <button className={styles.acceptButton} onClick={handleAccept}>
          Aceptar
        </button>
        <button className={styles.rejectButton} onClick={handleRefuse}>
          Rechazar
        </button>
      </div>
    </div>
  );
};

export default GameNotificationCard;