import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  fetchMessages,
  addMessage,
} from "../../redux/features/messages/messagesSlice";
import useChatSocket from "../../hooks/useChatSocket";
import { Message } from '../../redux/features/messages/messagesSlice';

const ConversationView = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const messages = useAppSelector((state) => state.messages.messages || []);
  const conversation = useAppSelector((state) =>
    state.messages.conversations.find(
      (conv) => conv.id === Number(conversationId)
    )
  );

  const [newMessage, setNewMessage] = useState("");

  const otherUser = conversation?.participants.find(
    (user) => user.id !== currentUser?.id
  );

  useEffect(() => {
    if (conversationId) {
      dispatch(fetchMessages(Number(conversationId)));
    }
  }, [conversationId, dispatch]);

  const { sendMessage } = useChatSocket({
    conversationId: Number(conversationId),
    onMessage: (incomingMessage) => {
      dispatch(addMessage(incomingMessage));
    },
  });

  const handleSend = () => {
    if (newMessage.trim() && currentUser) {
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`, // still a string, but allowed
        conversation: Number(conversationId),
        sender: currentUser.id,
        sender_username: currentUser.username,
        text: newMessage.trim(),
        created_at: new Date().toISOString(),
      };
      
      dispatch(addMessage(optimisticMessage));
      sendMessage(currentUser.id, newMessage.trim());
      setNewMessage("");
      
    }
  };
  

  return (
    <div className="max-w-4xl mx-auto border rounded shadow-lg h-[85vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-white sticky top-0 z-10">
        {otherUser?.profile_picture ? (
          <img
            src={otherUser.profile_picture}
            alt={otherUser.username}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white">
            {otherUser?.username?.[0].toUpperCase()}
          </div>
        )}
        <div>
          <div className="font-semibold text-gray-800">{otherUser?.username}</div>
          <div className="text-sm text-gray-500">Online</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
        {messages.map((msg) => {
          const isSender = msg.sender === currentUser?.id;

          return (
            <div
              key={msg.id || msg.created_at}
              className={`flex ${
                isSender ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs p-3 rounded-lg shadow-sm ${
                  isSender
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-900 rounded-bl-none"
                }`}
              >
                <div className="text-sm">{msg.text || msg.message}</div>
                <div className="text-[10px] mt-1 text-gray-300 text-right">
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-3 border-t bg-white">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleSend}
            className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversationView;
