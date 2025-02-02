'use client';

import Button from "@/components/button/button";
import { createContext, useState, useEffect, useContext } from "react";
import { toast } from 'react-hot-toast';

const WebSocketContext = createContext();
export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
  const [ws, setWs] = useState(null);
  const [connected, setConnected] = useState(false);
  const [request, setRequest] = useState([]);

  const connectWebSocket = (userId) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log("✅ WebSocket ya conectado");
      return;
    }

    const socket = new WebSocket(`wss://localhost:7203/socket?userId=${userId}`);

    socket.onopen = () => {
      console.log("✅ WebSocket conectado");
      setWs(socket);
      setConnected(true);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.Action) {
        case "friendRequestReceived":
          handleFriendRequest(data);
          break;

        default:
          console.error("No se ha leído el mensaje")
      }
    }

    socket.onerror = (error) => {
      console.error("❌ Error al conectar el WebSocket", error);
    };

    socket.onclose = () => {
      console.log("❌ WebSocket cerrado");
      setWs(null);
      setConnected(false);
    };
  };

  const closeWebSocket = () => {
    if (ws) {
      console.log("❌ Cerrando WebSocket...");
      ws.close();
      setWs(null);
      setConnected(false);
    }
  };

  const handleFriendRequest = (data) => {
    setRequest((prevRequest) => [
      ...prevRequest, { fromUserId: data.FromUserId, message: data.Message }
    ]);
    console.log(data.Message)
    toast.custom(
      <div style={{
        backgroundColor: 'var(--backgroundtoast)',
        color: 'var(--foreground)',
        fontSize: '16px',
        borderRadius: '8px',
        padding: '10px 20px',
        border: '2px solid rgba(255, 140, 0)',
        boxShadow: '0 0 10px rgba(255, 140, 0, 1), 0 0 15px rgba(255, 140, 0, 0.6)',
      }}>
        {data.Message}
      </div>
    );
  }

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (ws) {
        closeWebSocket();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [ws]);

  const contextValue = {
    ws,
    connectWebSocket,
    closeWebSocket,
    connected
  };


  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};
