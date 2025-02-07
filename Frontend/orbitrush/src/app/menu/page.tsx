'use client';

import MatchBox from "@/components/matchmaking/matchbox/matchbox";

export default function MenuPage() {

  return (
    <section className="flex gap-[10vh] py-12 text-center pr-12">

      <MatchBox variant="bot"/>
      <MatchBox variant="random"/>
      <MatchBox variant="friend"/>

    </section>
  );
}