import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  fetchMessages,
  addMessage,
} from "../../redux/features/messages/messagesSlice";
import useChatSocket from "../../hooks/useChatSocket";

const ConversationView = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const messages = useAppSelector((state) => state.messages.messages || []);


  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (conversationId) {
        dispatch(fetchMessages(Number(conversationId)));
    }
  }, [conversationId, dispatch]);

  // WebSocket hook
  const { sendMessage } = useChatSocket({
    conversationId: Number(conversationId),
    onMessage: (incomingMessage) => {
        dispatch(addMessage(incomingMessage));

    },
  });

  const handleSend = () => {
    if (newMessage.trim() && currentUser) {
      sendMessage(currentUser.id, newMessage.trim());
      setNewMessage("");
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Conversation #{conversationId}</h2>

      <div className="space-y-2 mb-4 max-h-[500px] overflow-y-auto border p-4 rounded">
      {messages.map((msg) => (
  <div
    key={msg.id || msg.created_at}
    className={`p-2 rounded ${
      msg.sender === currentUser?.id
        ? "bg-blue-100 text-right ml-auto"
        : "bg-gray-100"
    }`}
  >
    <div className="text-sm text-gray-500">{msg.sender_username}</div>
    <div>{msg.text || msg.message}</div>
    <div className="text-xs text-gray-400">
      {new Date(msg.created_at).toLocaleTimeString()}
    </div>
  </div>
))}

      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1 border px-3 py-2 rounded"
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ConversationView;
