import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import { fetchUserProfileAndPosts } from "../../../redux/features/profile/profileSlice";
import { toggleFollow, fetchFollowedUsers } from "../../../redux/features/follow/followSlice";
import { startConversation } from "../../../redux/features/messages/messagesSlice";
import { ProfileHeader } from "./ProfileHeader";
import { PostItem } from "./PostItem";
import { toggleLike } from "../../../redux/features/likes/likesSlice";
import { CommentSection } from "./CommentSection";

interface UserProfile {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  email: string;
  bio?: string;
  phone?: string;
  profile_picture?: string;
  followers_count: number;
  following_count: number;
}

interface Post {
  id: string;
  content: string;
  image?: string;
  created_at: string;
  likes: number;
  comments: Comment[];
}

const UserProfileView: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Redux selectors
  const {
    selectedUser,
    userPosts = [],
    loading: profileLoading,
    error: profileError,
  } = useSelector((state: RootState) => state.profile);

  const {
    followedUsers = [],
    loading: followLoading,
    error: followError,
  } = useSelector((state: RootState) => state.follow);

  const currentUser = useSelector((state: RootState) => state.auth.user);

  // Local state
  const [isFollowing, setIsFollowing] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState<string[]>([]);
  const [messageLoading, setMessageLoading] = useState(false);

  // Effects
  useEffect(() => {
    dispatch(fetchFollowedUsers());

    if (userId) {
      const userIdNumber = parseInt(userId, 10);
      dispatch(fetchUserProfileAndPosts(userIdNumber));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if (selectedUser && followedUsers) {
      setIsFollowing(followedUsers.some((id) => id === selectedUser.id));
    }
  }, [selectedUser, followedUsers]);

  // Handlers
  const handleToggleFollow = () => {
    if (selectedUser) {
      dispatch(toggleFollow(selectedUser.id));
    }
  };

  const handleMessage = async () => {
    if (!selectedUser?.id) return;
    setMessageLoading(true);
    try {
      const result = await dispatch(startConversation(selectedUser.id)).unwrap();
      navigate(`/conversation/${result.id}`);
    } catch (err) {
      console.error("Failed to start conversation:", err);
    } finally {
      setMessageLoading(false);
    }
  };

  const handleExpandPost = (postId: string) => {
    setExpandedPosts((prev) => 
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
  };

  // Loading and error states
  if (profileLoading) return <div className="text-center py-5">Loading profile...</div>;
  if (profileError || followError)
    return <div className="text-center py-5 text-red-500">{profileError || followError}</div>;
  if (!selectedUser) return <div className="text-center py-5">User not found</div>;

  const isOwnProfile = currentUser && currentUser.id === selectedUser.id;

  return (
    <div className="max-w-2xl mx-auto my-6 space-y-6">
      <ProfileHeader
        user={selectedUser}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        followLoading={followLoading}
        messageLoading={messageLoading}
        onToggleFollow={handleToggleFollow}
        onMessage={handleMessage}
      />

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-800">Posts</h2>
        {userPosts.length > 0 ? (
          userPosts.map((post) => (
            <div key={post.id} className="space-y-4">
              <PostItem
                post={post}
                user={selectedUser}
                currentUser={currentUser}
                isExpanded={expandedPosts.includes(post.id)}
                onExpandPost={() => handleExpandPost(post.id)}
              />
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No posts yet.</p>
        )}
      </div>
    </div>
  );
};

export default UserProfileView;