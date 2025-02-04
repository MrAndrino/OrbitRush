import React from "react";
import styles from "./notificationcard.module.css";

export interface GameNotification {
  id: number;
  sender: string;
}

interface GameNotificationProps {
  notification: GameNotification;
}

const GameNotificationCard = ({
  notification,
}: GameNotificationProps) => {
  const handleAccept = () => {

  };

  const handleRefuse = () => {

  };

  return (
    <div className={styles.notificationCard}>
      <span className={styles.notificationUser}>{notification.sender}</span>
      <span className={styles.notificationMessage}>quiere ser tu amig@</span>
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