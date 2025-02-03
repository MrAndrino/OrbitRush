'use client';

import { useState } from "react";
import UserList from '@/components/miscelaneus/cards/cardlists/userlist';
import styles from "./friendbox.module.css";
import { useUsers } from '@/context/userscontext';

export default function FriendBox() {
  const { friendList } = useUsers();
  const { search, setSearchTerm } = useUsers();  
    const [inputValue, setInputValue] = useState("");
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      setSearchTerm(value); 
      search(); 
    };

  return (
    <section className={styles.fbContainer}>
      <div className={styles.searchBox}>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder="Buscar amigos..."
      />
    </div>
      <UserList users={friendList} type='friend' />
    </section>
  );
}