import React, { useState, useRef, useEffect } from "react";
import FriendCard, { User } from "../friendcard/friendcard";
import styles from "./userlist.module.css";

interface UserListProps {
  users: User[];
  type: "user" | "friend";
}

const UserList = ({ users, type }: UserListProps) => {
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
  const userListRef = useRef<HTMLDivElement>(null);

  const handleExpand = (id: number) => {
    setExpandedCardId((prevId) => (prevId === id ? null : id));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userListRef.current && !userListRef.current.contains(event.target as Node)) {
        setExpandedCardId(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.userList} ref={userListRef}>
      {users.length === 0 ? (
        <p className="text-center pt-4">No hay usuarios disponibles</p>
      ) : (
        users.map((user) => (
          <FriendCard
            key={user.id}
            user={user}
            type={type}
            isExpanded={expandedCardId === user.id}
            handleExpand={() => handleExpand(user.id)}
          />
        ))
      )}
    </div>
  );
};

export default UserList;
