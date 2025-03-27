import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchConversations } from "../../redux/features/messages/messagesSlice";
import { RootState, AppDispatch } from "../../redux/store";
import { useNavigate } from "react-router-dom";
// import NewConversation from "./NewConversation";


const ConversationList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { conversations, loading, error } = useSelector(
    (state: RootState) => state.messages
  );
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const getOtherParticipantUsername = (participants: Participant[]) => {
    const other = participants.find((p) => p.id !== currentUser?.id);
    return other?.username || "Unknown";
  };
  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  const handleConversationClick = (conversationId: number) => {
    navigate(`/chat/${conversationId}`);
  };

  const getOtherParticipant = (participants: number[]) => {
    return participants.find((id) => id !== currentUser?.id);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Your Conversations</h2>
      {/* <NewConversation onConversationCreated={() => dispatch(fetchConversations())} /> */}


      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {conversations.length === 0 && !loading && <p>No conversations yet.</p>}

      <ul className="space-y-3">
        {conversations.map((conversation) => (
          <li
            key={conversation.id}
            className="p-4 bg-gray-100 rounded cursor-pointer hover:bg-gray-200"
            onClick={() => handleConversationClick(conversation.id)}
          >
            <p className="text-lg font-medium">
              Chat with {getOtherParticipantUsername(conversation.participants)}
            </p>
            <p className="text-sm text-gray-600">
              Last message:{" "}
              {conversation.messages?.slice(-1)[0]?.text || "No messages yet"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConversationList;
