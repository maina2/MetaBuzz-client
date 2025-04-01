import { useEffect, useRef } from "react";
import { useAppDispatch } from "../redux/hooks";
import { addNotification } from "../redux/features/notifications/notificationsSlice";
import { useAppSelector } from "../redux/hooks";

const useNotificationSocket = (userId: number | null) => {
  const dispatch = useAppDispatch();
  const socketRef = useRef<WebSocket | null>(null);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated || !userId) return;

    const wsUrl = `ws://localhost:8000/ws/notifications/${userId}/`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("Notifications WebSocket connected ✅");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("New notification received:", data);

      dispatch(addNotification(data));
    };

    socket.onclose = () => {
      console.log("Notifications WebSocket disconnected ❌");
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      socket.close();
    };
  }, [dispatch, userId, isAuthenticated]);

  return { socket: socketRef.current };
};

export default useNotificationSocket;
