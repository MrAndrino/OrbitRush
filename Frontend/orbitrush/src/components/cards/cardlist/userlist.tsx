import React, { useState } from "react";
import FriendCard, { User } from "../friendcard"; 
import styles from "./userlist.module.css";

interface UserListProps {
  users: User[];
  type: "user" | "friend"; 
}

const UserList = ({ users, type }: UserListProps) => {
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);

  const handleExpand = (id: number) => {
    setExpandedCardId((prevId) => (prevId === id ? null : id));
  };

  return (
    <div className={styles.userList}>
      {users.map((user) => (
        <FriendCard
          key={user.id}
          user={user}
          type={type}
          isExpanded={expandedCardId === user.id}
          handleExpand={() => handleExpand(user.id)}
        />
      ))}
    </div>
  );
};

export default UserList;
