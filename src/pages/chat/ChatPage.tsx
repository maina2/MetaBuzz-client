// src/pages/ChatPage.tsx
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMessages  } from "../../redux/features/messages/messagesSlice";
import { RootState } from "../../redux/store";
import { AppDispatch } from "../../redux/store"; // Adjust the path as needed

import { useChatSocket } from "../../hooks/useChatSocket";
import MessageBubble from "../../components/MessageBubble";

const ChatPage = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
//   const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const messages = useSelector((state: RootState) => state.messages.messages);
  const [text, setText] = useState("");
  const dispatch = useDispatch<AppDispatch>(); // ✅ typed for thunk support


  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { sendMessage } = useChatSocket({
    conversationId: Number(conversationId),
    senderId: currentUser.id,
  });

  useEffect(() => {
    if (conversationId) {
      dispatch(fetchMessages(Number(conversationId)));
    }
  }, [conversationId, dispatch]);

  useEffect(() => {
    // Auto scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(text.trim());
    setText("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 bg-gray-100">
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} isOwn={msg.sender === currentUser.id} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          className="flex-1 px-4 py-2 rounded border border-gray-300 focus:outline-none"
          placeholder="Type your message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatPage;
