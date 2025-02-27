import { useState, useEffect } from "react";
import { useWebSocket } from "@/context/websocketcontext";
import styles from "./chatbox.module.css";
import { useRef } from "react";

// 🟢 Definimos la interfaz del mensaje
interface ChatMessage {
    senderId: string;
    senderName: string;
    message: string;
    timestamp: string;
}

interface User {
    id: string;
    name: string;
}

const ChatBox = () => {
    const { sendChatMessage, requestChatHistory, chatMessages, sessionId } = useWebSocket();
    const [message, setMessage] = useState("");
    const chatEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (sessionId) {
            requestChatHistory(); // 📜 Cargar historial al entrar
        }
    }, [sessionId]);

    useEffect(() => {
        console.log("📥 Mensajes recibidos en chatMessages:", chatMessages);
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);
    

    const handleSendMessage = () => {
        if (message.trim()) {
            sendChatMessage(message);
            setMessage(""); // Limpiar input
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            event.preventDefault(); // Evitar salto de línea en el input
            handleSendMessage();
        }
    };

    return (
        <div className={styles.chatContainer}>
            <div className={styles.chatMessages}>
                {chatMessages.map((msg: ChatMessage, index: number) => (
                    <div key={index} className={styles.chatMessage}>
                        <span className={styles.timestamp}>{msg.timestamp}</span>
                        <strong>{msg.senderName}:</strong> {msg.message}
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>
            <div className={styles.chatInput}>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe un mensaje..."
                    className={styles.inputField}
                />
                <button onClick={handleSendMessage} className={styles.sendButton}>
                    Enviar
                </button>
            </div>
        </div>
    );
};

export default ChatBox;
