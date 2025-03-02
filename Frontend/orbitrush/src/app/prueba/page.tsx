"use client"

import GameBoard from "@/components/game/board/gameboard";
import ChatBox from "@/components/game/chatbox/chatbox";
import { useAuth } from "@/context/authcontext";
import { WebSocketProvider } from "@/context/websocketcontext";

const PruebaPage = () => {

  const { decodedToken } = useAuth();

  return (
    <WebSocketProvider>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <h1 className="text-3xl font-bold mb-4">:milky_way: Orbit Rush - Juego</h1>
        <GameBoard userId={decodedToken.id.toString()} />
        <ChatBox />
      </div>
    </WebSocketProvider>
  );
};

export default PruebaPage;