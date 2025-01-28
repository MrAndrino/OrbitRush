'use client';

import Footer from '@/components/footer/footer';
import Header from '@/components/header/header';
import { User } from '@/components/cards/friendcard';
import UserList from '@/components/cards/cardlist/userlist';

export default function MenuPage({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
    <section className="min-h-[100vh] flex flex-col">

      <Header />

      <section className='flex'>
        <div className="w-[80%] h-[75vh] py-12 px-24 overflow-auto scrollbar-hidden text-center">
          {children}
        </div>

        <div className='w-[20%]'>
          <UserList users={list1} type='friend' />
        </div>
      </section>

      <Footer />
    </section>
  );
}