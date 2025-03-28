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

  const getOtherParticipant = (
    participants: { id: number; username: string; profile_picture?: string }[]
  ) => {
    return participants.find((user) => user.id !== currentUser?.id);
  };

  const handleClick = (conversationId: number) => {
    navigate(`/messages/conversation/${conversationId}`);

  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Chats</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <ul className="space-y-3">
        {conversations.map((conv) => {
          const otherUser = getOtherParticipant(conv.participants);
          const lastMessage = conv.messages?.[conv.messages.length - 1];

          return (
            <li
              key={conv.id}
              className="p-3 rounded-xl hover:bg-gray-50 cursor-pointer flex items-center space-x-4 transition-all duration-200 border border-gray-200 shadow-sm"
              onClick={() => handleClick(conv.id)}
            >
              {/* Profile Picture or Initial */}
              {otherUser?.profile_picture ? (
                <img
                  src={otherUser.profile_picture}
                  alt={`${otherUser.username}'s profile`}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold text-lg">
                  {otherUser?.username[0].toUpperCase()}
                </div>
              )}

              {/* Username and last message */}
              <div className="flex-1">
                <div className="font-medium text-gray-900">{otherUser?.username}</div>
                <div className="text-sm text-gray-500 truncate max-w-xs">
                  {lastMessage ? lastMessage.text : "Start chatting..."}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ConversationsList;
