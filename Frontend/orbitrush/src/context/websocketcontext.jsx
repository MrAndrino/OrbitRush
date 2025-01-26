"use client";

import { createContext, useState, useEffect, useContext } from "react";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    const [ws, setWs] = useState(null);

    const connectWebSocket = (userId) => {
        return new Promise((resolve, reject) => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                console.log("✅ WebSocket ya conectado");
                return resolve();
            }

            const socket = new WebSocket(`wss://localhost:7203/socket?userId=${userId}`);

            socket.onopen = () => {
                console.log("✅ WebSocket conectado");
                setWs(socket);
                resolve();
            };

            socket.onerror = (error) => {
                console.error("❌ Error al conectar el WebSocket", error);
                reject(new Error("No se pudo conectar al WebSocket"));
            };

            socket.onclose = () => {
                console.log("❌ WebSocket cerrado");
                setWs(null);
            };
        });
    };

    const closeWebSocket = () => {
        if (ws) {
            console.log("❌ Cerrando WebSocket...");
            ws.close();
            setWs(null);
        }
    };

    useEffect(() => {
        const handleBeforeUnload = () => closeWebSocket();

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            closeWebSocket();
        };
    }, [ws]);

    return (
        <WebSocketContext.Provider value={{ ws, connectWebSocket, closeWebSocket }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);