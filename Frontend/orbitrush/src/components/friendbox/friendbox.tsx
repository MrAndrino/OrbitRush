'use client';

import UserList from '@/components/cards/cardlist/userlist';
import styles from "./friendbox.module.css";
import Search from '../search/search';
import { UserPlus } from 'lucide-react';
import { useUsers } from '@/context/userscontext';

export default function FriendBox() {
  const { friendList } = useUsers();

  return (
    <section className={styles.fbContainer}>
      <div className={styles.searchContainer}>
        <button className={styles.searchButton}><UserPlus /></button>
        <Search />
      </div>
      <UserList users={friendList} type='friend' />
    </section>
  );
}