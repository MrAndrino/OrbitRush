import { useState, useEffect } from "react";
import { useWebSocket } from "@/context/websocketcontext";
import styles from "./chatbox.module.css";
import { useRef } from "react";
import { Send } from 'lucide-react';

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
    const { sendChatMessage, ws, requestChatHistory, chatMessages, sessionId } = useWebSocket();
    const [message, setMessage] = useState("");
    const chatEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (sessionId) {
            requestChatHistory();
        }
    }, [sessionId]);

    useEffect(() => {
        console.log("📥 Mensajes recibidos en chatMessages:", chatMessages);
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);


    const handleSendMessage = () => {
        const currentSessionId = sessionId || sessionStorage.getItem("sessionId");

        if (!currentSessionId) {
            console.error("❌ No hay una sesión activa para enviar mensajes.");
            return;
        }

        if (message.trim()) {
            const payload = JSON.stringify({
                Action: "chatMessage",
                SessionId: currentSessionId,
                Message: message
            });

            console.log("📤 Enviando mensaje:", payload);
            ws.send(payload);
            setMessage("");
        }
    };



    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className={styles.chatContainer}>
            <div className={styles.chatMessages}>
                {chatMessages.map((msg: ChatMessage, index: number) => (
                    <div key={index} className={styles.chatMessage}>
                        <span className={styles.timestamp}>{msg.timestamp}</span>
                        <strong className="font-primary">{msg.senderName}:</strong> {msg.message}
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
                    <Send />
                </button>
            </div>
        </div>
    );
};

export default ChatBox;