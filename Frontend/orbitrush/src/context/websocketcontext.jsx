'use client';

import { createContext, useState, useEffect, useContext, useRef } from "react";
import { toast } from 'react-hot-toast';
import { useRouter } from "next/navigation";
import MatchFoundModal from "@/components/miscelaneus/modal/matchfound/matchfound";

const WebSocketContext = createContext();
export const useWebSocket = () => useContext(WebSocketContext);

// ========== WebSocketProvider ==========
export const WebSocketProvider = ({ children }) => {
  const [ws, setWs] = useState(null);
  const [connected, setConnected] = useState(false);
  const [request, setRequest] = useState([]);
  const [gameInvites, setGameInvites] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [matchData, setMatchData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);

  const [board, setBoard] = useState(Array(16).fill(0));
  const [currentPlayer, setCurrentPlayer] = useState(() => {
    return sessionStorage.getItem("currentPlayer") || null;
  });

  const [gameState, setGameState] = useState("Laying");
  const [sessionId, setSessionId] = useState(null);
  const [player1Id, setPlayer1Id] = useState(null);
  const [player2Id, setPlayer2Id] = useState(null);

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
      toast.success("Conectad@")
      setWs(socket);
      setConnected(true);
    };

    socket.onmessage = (event) => {
      socket.onmessage = (event) => {
        try {
          console.log("📩 Mensaje crudo recibido:", event.data);
          const data = JSON.parse(event.data);

          if (typeof data !== "object" || !data.Action) {
            console.error("❌ Estructura de mensaje inválida:", data);
            return;
          }

          console.log("✅ Mensaje validado:", data);
          switch (data.Action) {

            case "gameState":
              handleGameUpdate(data)
              break;

            case "chatMessage":
              setChatMessages((prev) => {
                return [...prev, {
                  senderId: data.SenderId,
                  senderName: data.SenderName,
                  message: data.Message,
                  timestamp: data.Timestamp,
                  sessionId: data.SessionId
                }];
              });

              break;

            case "chatHistory":
              if (data.SessionId === sessionId) {
                setChatMessages(data.Messages || []);
              }
              break;

            case "gameStarted":
              console.log("🎮 Partida iniciada: ", data);
              localStorage.setItem("sessionId", data.SessionId);
              console.log("✅ sessionId guardado en contexto y localStorage:", data.SessionId);

              router.push("/prueba");
              break;

            case "lobbyCreated":
              console.log("✅ Lobby creado, redirigiendo...");
              localStorage.setItem("lobbyId", data.LobbyId);
              setMatchData(null);
              router.push("/menu/lobby");
              break;

            case "lobbyUpdated":
              console.log("✅ Lobby actualizado:", data);
              break;

            case "playerLeftLobby":
              console.log("Un jugador ha abandonado el lobby");
              break;

            case "leftLobby":
              console.log("✅ Has salido del lobby. Redirigiendo...");
              localStorage.removeItem("lobbyId");
              router.push("/menu");
              toast.success(data.Message);
              break;

            case "playerLeftLobby":
              console.log("❌ Tu oponente ha abandonado el lobby.");
              toast.error("Tu oponente ha salido del lobby.");
              break;

            case "randomMatchFound":
              setMatchData({ matchId: data.MatchId, opponentId: data.Opponent });
              break;

            case "randomMatchAccepted":
              toast.success(data.Message);

              setMatchData((prev) => {
                if (prev) {
                  return { ...prev, acceptedByMe: true };
                }
                return prev;
              });
              break;

            case "randomMatchRejected":
            case "matchmakingCancelled":
              toast.error(data.Message);
              setMatchData(null);
              setIsSearching(false);
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
              console.warn("⚠️ Mensaje no reconocido:", data);
          }
        } catch (error) {
          console.error("❌ Error al procesar mensaje WebSocket:", event.data, error);
        }
      };
    }

    socket.onerror = (error) => {
      console.error("❌ Error al conectar el WebSocket", error);
    };

    socket.onclose = () => {
      console.log("❌ WebSocket cerrado");
      toast.error("Has sido desconectad@")
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
    console.log("setIsSearching(true) llamado");
    setIsSearching(true);
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

    setIsSearching(false);
    console.log("Enviando mensaje: ", mensaje);
    ws.send(mensaje);
  };

  // ----- Respuesta matchmaking -----
  const sendMatchResponse = (matchId, response) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    const message = JSON.stringify({
      Action: "randomMatchResponse",
      MatchId: matchId,
      Response: response
    });

    console.log("📤 Enviando respuesta: ", message);
    ws.send(message);
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

  // ----- Salir del lobby -----
  const leaveLobby = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error("❌ WebSocket no conectado");
      return;
    }

    const mensaje = JSON.stringify({
      Action: "leaveLobby",
    });

    console.log("📤 Enviando mensaje para salir del lobby: ", mensaje);
    ws.send(mensaje);
  };

  // ----- Empezar Partida -----
  const startGame = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error("❌ WebSocket no conectado");
      return;
    }

    const mensaje = JSON.stringify({
      Action: "startGame",
    });

    console.log("📤 Enviando mensaje para iniciar partida: ", mensaje);
    ws.send(mensaje);
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

  // ----- FUNCIÓN PARA ENVIAR MENSAJE -----
  const sendChatMessage = (message) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error("WebSocket no conectado");
      return;
    }

    const mensaje = JSON.stringify({
      Action: "chatMessage",
      SessionId: sessionId,
      Message: message,
    });

    ws.send(mensaje);
  };

  // ----- FUNCIÓN PARA PEDIR HISTORIAL -----
  const requestChatHistory = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error("WebSocket no conectado");
      return;
    }

    const mensaje = JSON.stringify({
      Action: "getChatHistory",
      SessionId: sessionId,
    });

    ws.send(mensaje);
  };

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

  // ----- Función para manejo del juego -----
  const handleGameUpdate = (data) => {
    console.log("📩 Actualización del juego recibida:", data);

    const formattedBoard = [];
    for (let i = 0; i < 4; i++) {
      formattedBoard.push(data.Board.slice(i * 4, i * 4 + 4));
    }

    console.log("✅ Tablero formateado correctamente:", formattedBoard);

    setBoard(formattedBoard);
    setCurrentPlayer(data.CurrentPlayer);
    setGameState(data.State);
  };
  
 
  // Guarda currentPlayer en sessionStorage cada vez que cambia
  useEffect(() => {
    if (currentPlayer !== null) {
      sessionStorage.setItem("currentPlayer", currentPlayer);
    }
  }, [currentPlayer]);

  // Recupera currentPlayer si se resetea a null
  useEffect(() => {
    if (currentPlayer === null) {
      const storedPlayer = sessionStorage.getItem("currentPlayer");
      if (storedPlayer) {
        setCurrentPlayer(storedPlayer);
      }
    }
  }, [currentPlayer]);

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
    isSearching,
    setIsSearching,
    onlineCount,
    gameInvites,
    playWithBot,
    sendMatchResponse,
    leaveLobby,
    startGame,
    board,
    currentPlayer,
    gameState,
    sessionId,
    sendChatMessage,
    requestChatHistory,
    chatMessages
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
      {matchData && (
        <MatchFoundModal
          isOpen={!!matchData}
          onClose={() => setMatchData(null)}
          matchId={matchData.matchId}
          opponentId={matchData.opponentId}
          sendResponse={sendMatchResponse}
        />
      )}
    </WebSocketContext.Provider>
  );
};