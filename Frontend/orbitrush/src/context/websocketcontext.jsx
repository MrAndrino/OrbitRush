'use client';

import { createContext, useState, useEffect, useContext } from "react";
import { toast } from 'react-hot-toast';
import { useRouter } from "next/navigation";

const WebSocketContext = createContext();
export const useWebSocket = () => useContext(WebSocketContext);

// ========== WebSocketProvider ==========
export const WebSocketProvider = ({ children }) => {
  const [ws, setWs] = useState(null);
  const [connected, setConnected] = useState(false);
  const [request, setRequest] = useState([]);
  const [gameInvites, setGameInvites] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const router = useRouter();

  // ----- Conexión del WebSocket -----
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
      console.log("data: ", data)
      switch (data.Action) {

        case "lobbyCreated":
          console.log("✅ Lobby creado, redirigiendo...");
          localStorage.setItem("lobbyId", data.LobbyId);
          router.push("/menu/lobby");
          break;

        case "lobbyUpdated":
          console.log("✅ Lobby actualizado:", data);
          break;

        case "randomMatchFound":
          toast.success(data.Message);
          break;

        case "matchmakingCancelled":
          toast.error(data.Message);
          break;

        case "randomMatchRejected":
          toast.error(data.Message);
          break;

        case "randomMatchAccepted":
          toast.success(data.Message);
          break;

        case "invitationReceived":
          setGameInvites((prev) => [...prev, { id: Date.now(), sender: data.FromUserName, senderId: data.FromUserId }]);
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
          break;

        case "answerGameRequest":
          setGameInvites((prev) => {
            const updatedInvites = prev.filter(inv => inv.senderId !== data.TargetId);
            return updatedInvites;
          });
          break;

        case "friendRequestReceived":
          handleFriendRequest(data);
          const friendRequestEvent = new CustomEvent("friendRequestReceived", {
            detail: data,
          });
          window.dispatchEvent(friendRequestEvent);
          break;

        case "acceptFriendRequest":
          toast.success(data.Message)
          const acceptFriendEvent = new CustomEvent("acceptFriendRequest", {
            detail: data,
          });
          window.dispatchEvent(acceptFriendEvent);
          break;

        case "userStateChanged":
          const friendStateEvent = new CustomEvent("friendStateUpdate", {
            detail: { userId: data.userId, newState: data.State }
          });
          window.dispatchEvent(friendStateEvent);
          break;

        case "onlineCountUpdate":
          console.log('Nuevo conteo de usuarios conectados:', data.OnlineCount);
          setOnlineCount(data.OnlineCount);
          break;

        case "updateFriendList":
          const updateFriendEvent = new CustomEvent("updateFriendList", {
            detail: { friends: data.Friends }
          });
          window.dispatchEvent(updateFriendEvent);
          break;

        case "deleteFriend":
          const deleteFriendEvent = new CustomEvent("deleteFriend", {
            detail: { friends: data.Friends }
          });
          window.dispatchEvent(deleteFriendEvent);
          break;

        default:
          console.error("No se ha leído el mensaje");
      }
    };

    socket.onerror = (error) => {
      console.error("❌ Error al conectar el WebSocket", error);
    };

    socket.onclose = () => {
      console.log("❌ WebSocket cerrado");
      setWs(null);
      setConnected(false);
    };
  };

  // ----- Cierre del WebSocket -----
  const closeWebSocket = () => {
    if (ws) {
      console.log("❌ Cerrando WebSocket...");
      ws.close();
      setWs(null);
      setConnected(false);
    }
  };

  // ----- Manejo de solicitud de amistad recibida -----
  const handleFriendRequest = (data) => {
    setRequest((prevRequest) => [
      ...prevRequest,
      { fromUserId: data.FromUserId, message: data.Message }
    ]);
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
  };

  // ----- Envío de solicitud de amistad -----
  const sendFriendRequest = (targetId) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error("Web Socket no conectado");
      return;
    }
    const mensaje = JSON.stringify({
      Action: "sendFriendRequest",
      TargetId: `${targetId}`
    });
    console.log("mensaje: ", mensaje);
    ws.send(mensaje);
  };

  // ----- Envío de solicitud de partida -----
  const sendGameRequest = (targetId) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error("WebSocket no conectado");
      return;
    }
    const mensaje = JSON.stringify({
      Action: "sendGameRequest",
      TargetId: `${targetId}`
    });
    console.log("mensaje: ", mensaje);
    ws.send(mensaje);
  };

  // ----- Responder solicitud de partida -----
  const respondToGameRequest = (targetId, response) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error("WebSocket no conectado");
      return;
    }
    const mensaje = JSON.stringify({
      Action: "answerGameRequest",
      TargetId: `${targetId}`,
      Response: response
    });
    console.log("mensaje: ", mensaje);
    ws.send(mensaje);

    if (response === "accept") {
      toast.success("Has aceptado la invitación");
    } else {
      toast.error("Has rechazado la invitación");
    }

    setGameInvites((prev) => prev.filter(inv => inv.senderId !== targetId));
  };

  // ----- Aceptar solicitud de amistad -----
  const acceptFriendRequest = (targetId) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error("Web Socket no conectado");
      return;
    }
    const mensaje = JSON.stringify({
      Action: "acceptFriendRequest",
      TargetId: `${targetId}`
    });
    console.log("mensaje: ", mensaje);
    ws.send(mensaje);
  };

  // ----- Eliminar amigo -----
  const deleteFriend = (targetId) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error("Web Socket no conectado");
      return;
    }
    const mensaje = JSON.stringify({
      Action: "deleteFriend",
      TargetId: `${targetId}`
    });
    console.log("mensaje: ", mensaje);
    ws.send(mensaje);
  };

  // ----- Entrar en la cola para matchmaking -----
  const queueForMatch = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error("WebSocket no conectado");
      return;
    }

    const mensaje = JSON.stringify({
      Action: "queueForMatch",
    });

    console.log("Enviando mensaje: ", mensaje);
    ws.send(mensaje);
    toast.success("Buscando partida...");
  };

  // ----- Cancelar matchmaking -----
  const cancelMatchmaking = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error("WebSocket no conectado");
      return;
    }

    const mensaje = JSON.stringify({
      Action: "cancelMatchmaking",
    });

    console.log("Enviando mensaje: ", mensaje);
    ws.send(mensaje);
  };

  // ----- Jugar vs Bot -----
  const playWithBot = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error("❌ WebSocket no conectado");
      return;
    }

    console.log("🎮 Enviando solicitud para jugar contra un bot...");
    ws.send(JSON.stringify({ Action: "playWithBot" }));

    const handleMessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.Action === "lobbyCreated") {
        console.log("✅ Lobby contra bot creado. Redirigiendo...");
        localStorage.setItem("lobbyId", data.LobbyId);
        router.push("/menu/lobby");
      }
    };

    ws.addEventListener("message", handleMessage);

    return () => {
      ws.removeEventListener("message", handleMessage);
    };
  };



  // ----- useEffect para redirección al crear lobby -----
  useEffect(() => {
    if (!ws) return;

    const handleMessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.Action === "lobbyCreated") {
        console.log("Redirigiendo al lobby...");
        router.push("/menu/lobby");
      }
    };

    ws.addEventListener("message", handleMessage);

    return () => {
      ws.removeEventListener("message", handleMessage);
    };
  }, [ws]);



  // ----- useEffect para manejo del cierre del WebSocket al salir de la página -----
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


  // ----- Valor del contexto y renderizado-----
  const contextValue = {
    ws,
    connectWebSocket,
    closeWebSocket,
    connected,
    sendFriendRequest,
    acceptFriendRequest,
    deleteFriend,
    sendGameRequest,
    respondToGameRequest,
    queueForMatch,
    cancelMatchmaking,
    onlineCount,
    gameInvites,
    playWithBot
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};