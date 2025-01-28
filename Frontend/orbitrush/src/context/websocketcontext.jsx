"use client";

import { createContext, useState, useEffect, useContext } from "react";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    const [ws, setWs] = useState(null);

    const connectWebSocket = (userId) => {
        console.log("🔄 Intentando conectar al WebSocket...");
        console.log("📨 userId recibido para conectar:", userId);
    
        return new Promise((resolve, reject) => {
            if (!userId) {
                console.error("❌ No se puede conectar al WebSocket sin un userId válido");
                return reject(new Error("userId no proporcionado"));
            }
    
            if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) {
                console.log("✅ WebSocket ya conectado o en proceso de conexión");
                return resolve();
            }
    
            if (ws) {
                console.log("ℹ️ Cerrando WebSocket anterior antes de reconectar...");
                ws.onclose = () => {
                    console.log("✅ WebSocket cerrado completamente.");
                    createNewWebSocket(userId, resolve, reject);
                };
                ws.close();
            } else {
                createNewWebSocket(userId, resolve, reject);
            }
        });
    };
    
    const createNewWebSocket = (userId, resolve, reject) => {
        const url = `wss://localhost:7203/socket?userId=${userId}`;
        console.log("🌐 Creando WebSocket con URL:", url);
    
        const socket = new WebSocket(url);
    
        socket.onopen = () => {
            console.log("✅ WebSocket conectado exitosamente");
            setWs(socket);
            resolve();
        };
    
        socket.onerror = (error) => {
            console.error("❌ Error al conectar el WebSocket:", error);
            reject(new Error("No se pudo conectar al WebSocket"));
        };
    
        socket.onclose = (event) => {
            console.log("❌ WebSocket cerrado. Código:", event.code, "Razón:", event.reason);
            setWs(null);
        };
    };

    const closeWebSocket = () => {
        if (ws) {
            console.log("❌ Cerrando WebSocket...");
            ws.close();
            setWs(null);
        } else {
            console.log("ℹ️ No hay WebSocket abierto para cerrar.");
        }
    };

    useEffect(() => {
        const handleBeforeUnload = () => {
            console.log("🔄 Evento beforeunload detectado, cerrando WebSocket...");
            closeWebSocket();
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            console.log("🧹 Limpiando listeners y cerrando WebSocket...");
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

export const useWebSocket = () => {
    console.log("🪝 useWebSocket hook utilizado");
    return useContext(WebSocketContext);
};