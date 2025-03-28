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
  existingMessages: Message[]; // ✅ new prop
};

const useChatSocket = ({ conversationId, onMessage, existingMessages }: UseChatSocketProps) => {
  const socketRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);
  const messagesRef = useRef(existingMessages);

  // Keep refs updated
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    messagesRef.current = existingMessages;
  }, [existingMessages]);

  useEffect(() => {
    const wsUrl = `ws://localhost:8000/ws/chat/${conversationId}/`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected ✅");
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

      const isDuplicate = messagesRef.current.some(
        (msg) =>
          msg.sender === incomingMessage.sender &&
          msg.text === incomingMessage.text &&
          Math.abs(new Date(msg.created_at).getTime() - new Date(incomingMessage.created_at).getTime()) < 5000
      );

      if (!isDuplicate) {
        console.log("WebSocket received message:", incomingMessage);
        onMessageRef.current(incomingMessage);
      } else {
        console.log("Duplicate WebSocket message ignored.");
      }
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
