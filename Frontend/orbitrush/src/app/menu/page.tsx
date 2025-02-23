'use client';

import { useWebSocket } from "@/context/websocketcontext";
import MatchBox from "@/components/matchmaking/matchbox/matchbox";

export default function MenuPage() {
  const { isSearching } = useWebSocket();
  console.log("MenuPage rendering, isSearching =", isSearching);
  
  return (
    <section className="flex gap-[10vh] py-12 text-center pr-12">
      <MatchBox variant="bot" isSearching={isSearching} />
      <MatchBox variant="random" isSearching={isSearching} />
      <MatchBox variant="friend" isSearching={isSearching} />
    </section>
  );
}
