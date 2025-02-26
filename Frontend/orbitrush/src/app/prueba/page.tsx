"use client"

import GameBoard from "@/components/game/board/gameboard";
import { WebSocketProvider } from "@/context/websocketcontext";

const PruebaPage = () => {
  return (
    <WebSocketProvider>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <h1 className="text-3xl font-bold mb-4">🌌 Orbit Rush - Juego</h1>
        <GameBoard />
      </div>
    </WebSocketProvider>
  );
};

export default PruebaPage;
