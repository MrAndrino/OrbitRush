"use client";

import GameLayout from "@/components/game/gamelayout/gamelayout";
import { useAuth } from "@/context/authcontext";

const GamePage = () => {
  const {decodedToken} = useAuth();

  return (
    <>
      <GameLayout userId={decodedToken.id.toString()}  />
    </>
  );
};

export default GamePage;
