import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchConversations } from "../../redux/features/messages/messagesSlice";
import { useNavigate } from "react-router-dom";

const ConversationsList = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { conversations, loading, error } = useAppSelector((state) => state.messages);
  const currentUser = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  // Updated: Get the other user object, not just the ID
  const getOtherParticipant = (participants: { id: number; username: string }[]) => {
    return participants.find((user) => user.id !== currentUser?.id);
  };

  const handleClick = (conversationId: number) => {
    navigate(`/conversation/${conversationId}`);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Your Conversations</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <ul className="space-y-3">
        {conversations.map((conv) => {
          const otherUser = getOtherParticipant(conv.participants as any); // Cast needed unless you update the type
          return (
            <li
              key={conv.id}
              className="p-3 border rounded hover:bg-gray-100 cursor-pointer"
              onClick={() => handleClick(conv.id)}
            >
              <div className="font-medium">
                Conversation with <span className="text-blue-600">{otherUser?.username}</span>
              </div>
              <div className="text-sm text-gray-600">
                Conversation ID: {conv.id}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ConversationsList;
