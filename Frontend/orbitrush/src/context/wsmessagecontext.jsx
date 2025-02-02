'use client'

import { useWebSocket } from "./websocketcontext";
import { createContext, useState, useEffect, useContext } from "react";

export const WSMessageContext = createContext();
export const useWSM = () => {
  return useContext(WSMessageContext);
};

export const WSMessageProvider = ({ children }) => {

  const { ws } = useWebSocket();

  const sendFriendRequest = (targetId) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error("Web Socket no conectado")
      return;
    }
    const mensaje = JSON.stringify({
      Action: "sendFriendRequest",
      TargetId: `${targetId}`
    });
    console.log("mensaje: ", mensaje)
    ws.send(mensaje);
  }


  
  const contextValue = {
    sendFriendRequest
  };

  return (
    <WSMessageContext.Provider value={contextValue}>
      {children}
    </WSMessageContext.Provider>
  );
}