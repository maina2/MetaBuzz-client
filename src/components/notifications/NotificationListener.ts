import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { addNotification } from "../../redux/features/notifications/notificationsSlice";

const NotificationListener = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!user) return; // Only connect if user is logged in

    const wsUrl = `ws://localhost:8000/ws/notifications/${user.id}/`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("Notification WebSocket connected ✅");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("New Notification:", data);

      dispatch(
        addNotification({
          id: data.id,
          message: data.message,
          is_read: false,
          timestamp: data.timestamp,
        })
      );
    };

    socket.onclose = () => {
      console.log("Notification WebSocket disconnected ❌");
    };

    socket.onerror = (error) => {
      console.error("Notification WebSocket error:", error);
    };

    return () => {
      socket.close();
    };
  }, [dispatch, user]);

  return null; // This component doesn't render anything
};

export default NotificationListener;
