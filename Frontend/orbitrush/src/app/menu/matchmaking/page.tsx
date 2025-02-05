'use client';

import MatchBox from "@/components/matchmaking/matchbox/matchbox";

export default function MatchmakingPage() {

  return (
    <section className="flex gap-[10vh] py-12 text-center">

      <MatchBox variant="bot"/>
      <MatchBox variant="random"/>
      <MatchBox variant="friend"/>

    </section>
  );
}