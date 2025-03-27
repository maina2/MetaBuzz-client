import { useEffect, useRef } from "react";

type UseChatSocketProps = {
  conversationId: number;
  onMessage: (message: any) => void;
};

const useChatSocket = ({ conversationId, onMessage }: UseChatSocketProps) => {
  const socketRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);

  // Keep ref updated with latest onMessage handler
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    const wsUrl = `ws://localhost:8000/ws/chat/${conversationId}/`;

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected ✅");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      const normalizedMessage = {
        id: Date.now(), // temporary fallback id
        sender_username: data.sender_username,
        text: data.message, // normalize field name
        created_at: data.created_at,
      };

      console.log("WebSocket received message:", normalizedMessage);
      onMessageRef.current(normalizedMessage);
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
  }, [conversationId]); // ✅ safe now

  const sendMessage = (senderId: number, text: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          sender_id: senderId,
          message: text, // ✅ frontend sends `message`
        })
      );
    } else {
      console.warn("WebSocket is not connected.");
    }
  };

  return { sendMessage };
};

export default useChatSocket;
