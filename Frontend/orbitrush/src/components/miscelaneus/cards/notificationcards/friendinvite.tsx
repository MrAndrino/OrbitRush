import React from "react";
import styles from "./notificationcard.module.css";
import { useUsers } from "@/context/userscontext";
import { useWebSocket } from "@/context/websocketcontext";

export interface FriendNotification {
  id: number;
  senderId: number;
  targetId: number;
  senderName: string;
}

interface FriendNotificationProps {
  notification: FriendNotification;
}

const FriendNotificationCard = ({notification}: FriendNotificationProps) => {

  const {handleRejectFriend, getFriendReq} = useUsers();
  const {acceptFriendRequest} = useWebSocket();
  
  const handleAccept = () => {
    acceptFriendRequest(notification.senderId)
    getFriendReq();
  };

  const handleRefuse = () => {
    handleRejectFriend(notification.senderId);
  };

  return (
    <div className={styles.notificationCard}>
      <span className={styles.notificationMessage}>
        {notification.senderName} quiere ser tu amigo
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
