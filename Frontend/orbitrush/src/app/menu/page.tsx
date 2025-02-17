'use client';

import { useState } from "react";
import MatchBox from "@/components/matchmaking/matchbox/matchbox";

export default function MenuPage() {
  const [isSearching, setIsSearching] = useState(false);

  return (
    <section className="flex gap-[10vh] py-12 text-center pr-12">
      <MatchBox variant="bot" isSearching={isSearching} setIsSearching={setIsSearching} />
      <MatchBox variant="random" isSearching={isSearching} setIsSearching={setIsSearching} />
      <MatchBox variant="friend" isSearching={isSearching} setIsSearching={setIsSearching} />
    </section>
  );
}
