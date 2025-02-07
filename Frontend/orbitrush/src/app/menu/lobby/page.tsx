'use client';

import LobbyBox from "@/components/matchmaking/lobbybox/lobbybox";

const sampleUsers = [
  {
    name: "Alice Smith",
    image: "/images/OrbitRush-TrashCan.jpg", 
  },
  {
    name: "Bob Johnson",
    image: "/images/OrbitRush-TrashCan.jpg", 
  },
];

export default function LobbyPage() {
  return (
    <section className="text-center w-[100%]">
      <LobbyBox users={sampleUsers} /> 
    </section>
  );
}
