// src/hooks/useChatSocket.ts
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { addMessage } from "../redux/features/messages/messagesSlice";

interface UseChatSocketProps {
  conversationId: number;
  senderId: number;
}

const WEBSOCKET_BASE = "ws://127.0.0.1:8000/ws/chat"; // Use ws:// for localhost

export const useChatSocket = ({ conversationId, senderId }: UseChatSocketProps) => {
  const dispatch = useDispatch();
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socketUrl = `${WEBSOCKET_BASE}/${conversationId}/`;
    const socket = new WebSocket(socketUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      dispatch(addMessage(data)); // Automatically adds the real-time message to Redux state
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      socket.close();
    };
  }, [conversationId, dispatch]);

  const sendMessage = (text: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          sender_id: senderId,
          text,
        })
      );
    } else {
      console.warn("WebSocket not connected yet.");
    }
  };

  return {
    sendMessage,
  };
};
