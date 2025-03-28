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
        id: `temp-${Date.now()}`,
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
    <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden border-none h-[85vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="relative">
          {otherUser?.profile_picture ? (
            <img
              src={otherUser.profile_picture}
              alt={otherUser.username}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-300 shadow-md"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
              {otherUser?.username?.[0].toUpperCase()}
            </div>
          )}
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
        </div>
        <div>
          <div className="font-semibold text-gray-800 text-lg">{otherUser?.username}</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50">
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
                className={`max-w-xs p-4 rounded-2xl shadow-md ${
                  isSender
                    ? "bg-blue-500 text-white rounded-br-sm"
                    : "bg-white text-gray-800 rounded-bl-sm border border-gray-200"
                }`}
              >
                <div className="text-sm leading-relaxed">{msg.text || msg.message}</div>
                <div className={`text-[10px] mt-2 opacity-70 text-right ${
                  isSender ? "text-blue-100" : "text-gray-500"
                }`}>
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
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-300"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="bg-blue-500 text-white px-4 py-2.5 rounded-xl hover:bg-blue-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversationView;