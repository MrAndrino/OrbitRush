"use client";

import { createContext, useState, useEffect, useContext } from "react";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    const [ws, setWs] = useState(null);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const socket = new WebSocket(`wss://${BASE}/ws`); 

        socket.onopen = () => console.log("✅ WebSocket conectado");
        socket.onmessage = (event) => {
            console.log("📩 Mensaje recibido:", event.data);
            setMessages((prev) => [...prev, event.data]); // Guardar mensajes recibidos
        };
        socket.onclose = () => console.log("❌ WebSocket cerrado");

        setWs(socket);

        return () => socket.close(); // Cerrar WebSocket al desmontar
    }, []);

    const sendMessage = (msg) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(msg);
        }
    };

    return (
        <WebSocketContext.Provider value={{ ws, messages, sendMessage }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);
