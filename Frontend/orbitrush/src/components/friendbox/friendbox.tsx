'use client';

import { User } from '@/components/cards/friendcard';
import UserList from '@/components/cards/cardlist/userlist';
import styles from "./friendbox.module.css";
import Search from '../search/search';
import { UserPlus } from 'lucide-react';

export default function FriendBox() {
  const list1: User[] = [
    { id: 1, name: "Joderostiaputaya", image: "https://i.pravatar.cc/150?u=alice", status: "Connected" },
    { id: 2, name: "Bob", image: "https://i.pravatar.cc/150?u=bob", status: "Playing" },
    { id: 3, name: "Charlie", image: "https://i.pravatar.cc/150?u=charlie", status: "Disconnected" },
    { id: 4, name: "Joderostiaputaya", image: "https://i.pravatar.cc/150?u=alice", status: "Connected" },
    { id: 5, name: "Bob", image: "https://i.pravatar.cc/150?u=bob", status: "Playing" },
    { id: 6, name: "Charlie", image: "https://i.pravatar.cc/150?u=charlie", status: "Disconnected" },
    { id: 7, name: "Joderostiaputaya", image: "https://i.pravatar.cc/150?u=alice", status: "Connected" },
    { id: 8, name: "Bob", image: "https://i.pravatar.cc/150?u=bob", status: "Playing" },
    { id: 9, name: "Charlie", image: "https://i.pravatar.cc/150?u=charlie", status: "Disconnected" },
    { id: 10, name: "Joderostiaputaya", image: "https://i.pravatar.cc/150?u=alice", status: "Connected" },
    { id: 11, name: "Bob", image: "https://i.pravatar.cc/150?u=bob", status: "Playing" },
    { id: 12, name: "Charlie", image: "https://i.pravatar.cc/150?u=charlie", status: "Disconnected" },
  ];

  return (
    <section className={styles.fbContainer}>
      <div className={styles.searchContainer}>
        <button className={styles.searchButton}><UserPlus/></button>
        <Search />
      </div>
      <UserList users={list1} type='friend' />
    </section>
  );
}