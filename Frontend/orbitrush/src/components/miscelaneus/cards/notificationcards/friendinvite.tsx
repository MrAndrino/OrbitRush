import React from "react";
import styles from "./notificationcard.module.css";

export interface FriendNotification {
  id: number;
  sender: string;
}

interface FriendNotificationProps {
  notification: FriendNotification;
  onAcceptFriend: (id: number) => void;
  onRefuseFriend: (id: number) => void;
}

const FriendNotificationCard = ({notification, onAcceptFriend, onRefuseFriend,}: FriendNotificationProps) => {
  
  const handleAccept = () => {
    onAcceptFriend(notification.id);
  };

  const handleRefuse = () => {
    onRefuseFriend(notification.id);
  };

  return (
    <div className={styles.notificationCard}>
      <span className={styles.notificationMessage}>
        {notification.sender} quiere ser tu amigo
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

export default FriendNotificationCard;
