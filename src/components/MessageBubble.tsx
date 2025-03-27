// src/components/MessageBubble.tsx
import React from "react";

interface Message {
  id: number;
  sender: number;
  sender_username: string;
  text: string;
  created_at: string;
}

interface Props {
  message: Message;
  isOwn: boolean;
}

const MessageBubble: React.FC<Props> = ({ message, isOwn }) => {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] px-4 py-2 rounded-lg shadow ${
          isOwn ? "bg-blue-500 text-white" : "bg-white text-gray-800"
        }`}
      >
        {!isOwn && (
          <p className="text-sm font-semibold text-gray-600 mb-1">
            {message.sender_username}
          </p>
        )}
        <p>{message.text}</p>
        <p className="text-xs text-gray-300 mt-1 text-right">{new Date(message.created_at).toLocaleTimeString()}</p>
      </div>
    </div>
  );
};

export default MessageBubble;
