// src/components/messages/MessagesLayout.tsx
import { Outlet } from "react-router-dom";
import ConversationList from "./ConversationList";

const MessagesLayout = () => {
  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-full flex rounded-xl shadow-lg overflow-hidden bg-white border border-gray-200">
        {/* Left Pane - Conversation List */}
        <div className="w-full md:w-1/3 border-r border-gray-200 bg-gray-50">
          <ConversationList />
        </div>

        {/* Right Pane - Conversation View or Placeholder */}
        <div className="flex-1 bg-white">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MessagesLayout;
