import { useEffect, useRef } from "react";

type Message = {
  id: number | string;
  sender: number;
  sender_username: string;
  text: string;
  created_at: string;
};

type UseChatSocketProps = {
  conversationId: number;
  onMessage: (message: Message) => void;
};

const useChatSocket = ({ conversationId, onMessage }: UseChatSocketProps) => {
  const socketRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    const wsUrl = `ws://localhost:8000/ws/chat/${conversationId}/`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected   ");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      const incomingMessage: Message = {
        id: Date.now(), // fallback id
        sender: data.sender_id,
        sender_username: data.sender_username,
        text: data.message,
        created_at: data.created_at,
      };

      console.log("WebSocket received message:", incomingMessage);
      onMessageRef.current(incomingMessage);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected ❌");
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      socket.close();
    };
  }, [conversationId]);

  const sendMessage = (senderId: number, text: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          sender_id: senderId,
          message: text,
        })
      );
    } else {
      console.warn("WebSocket is not connected.");
    }
  };

  return { sendMessage };
};

export default useChatSocket;
