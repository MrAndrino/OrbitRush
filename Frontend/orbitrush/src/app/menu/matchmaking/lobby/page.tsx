'use client';

import LobbyBox from "@/components/matchmaking/lobbybox/lobbybox";

const sampleUsers = [
  {
    name: "Alice Smith",
    image: "https://picsum.photos/seed/alice/200/200", 
  },
  {
    name: "Bob Johnson",
    image: "https://picsum.photos/seed/bob/200/200", 
  },
];

export default function MatchmakingPage() {
  return (
    <section className="text-center w-[100%]">
      <LobbyBox users={sampleUsers} /> 
    </section>
  );
}
