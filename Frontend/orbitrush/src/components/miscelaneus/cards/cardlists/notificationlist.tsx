import React from "react";
import FriendNotificationCard, { FriendNotification } from "@/components/miscelaneus/cards/notificationcards/friendinvite";
import GameNotificationCard, { GameNotification } from "@/components/miscelaneus/cards/notificationcards/gameinvite";
import styles from "./notificationlist.module.css";

interface NotificationListProps {
  notifications: FriendNotification[] | GameNotification[];
  type: "friend" | "game";

  onAcceptFriend?: (id: number) => void;
  onRefuseFriend?: (id: number) => void;
  onAcceptGame?: (id: number) => void;
  onRefuseGame?: (id: number) => void;
}

const NotificationList = ({ notifications, type, onAcceptFriend, onRefuseFriend, onAcceptGame, onRefuseGame, }: NotificationListProps) => {


  return (
    <div className={styles.notificationList}>
      {notifications.map((notification) =>
        type === "friend" ? (
          <FriendNotificationCard
            key={notification.id}
            notification={notification as FriendNotification}
            onAcceptFriend={onAcceptFriend!}
            onRefuseFriend={onRefuseFriend!}
          />
        ) : (
          <GameNotificationCard
            key={notification.id}
            notification={notification as GameNotification}
            onAcceptGame={onAcceptGame!}
            onRefuseGame={onRefuseGame!}
          />
        )
      )}
    </div>
  );
};

export default NotificationList;
