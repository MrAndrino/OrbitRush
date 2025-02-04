import React from "react";
import FriendNotificationCard, { FriendNotification } from "@/components/miscelaneus/cards/notificationcards/friendinvite";
import GameNotificationCard, { GameNotification } from "@/components/miscelaneus/cards/notificationcards/gameinvite";
import styles from "./notificationlist.module.css";

interface NotificationListProps {
  notifications: FriendNotification[] | GameNotification[];
  type: "friend" | "game";
}

const NotificationList = ({ notifications, type }: NotificationListProps) => {


  return (
    <div className={styles.notificationList}>
      {notifications.map((notification) =>
        type === "friend" ? (
          <FriendNotificationCard
            key={notification.id}
            notification={notification as FriendNotification}
          />
        ) : (
          <GameNotificationCard
            key={notification.id}
            notification={notification as GameNotification}
          />
        )
      )}
    </div>
  );
};

export default NotificationList;
