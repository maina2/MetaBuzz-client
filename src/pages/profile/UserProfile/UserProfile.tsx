import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { AppDispatch, RootState } from "../../../redux/store";
import { fetchUserProfileAndPosts } from "../../../redux/features/profile/profileSlice";
import { toggleFollow, fetchFollowedUsers } from "../../../redux/features/follow/followSlice";
import { startConversation } from "../../../redux/features/messages/messagesSlice";
import { ProfileHeader } from "./ProfileHeader";
import { PostItem } from "./PostItem";
import { toggleLike } from "../../../redux/features/likes/likesSlice";

// import { formatDate } from "./utils";

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

interface Comment {
  id: string;
  text: string;
  user: { username: string };
  created_at: string;
}

interface Post {
  id: string;
  content: string;
  image?: string;
  created_at: string;
  likes: number;
  comments: Comment[];
}

const API_URL = "http://127.0.0.1:8000";

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
  const token = useSelector((state: RootState) => state.auth.token);

  // Local state
  const [isFollowing, setIsFollowing] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState<string[]>([]);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [commentStates, setCommentStates] = useState<{
    [postId: string]: {
      isCommenting: boolean;
      newComment: string;
      isSubmitting: boolean;
    };
  }>({});
  const [messageLoading, setMessageLoading] = useState(false);

  // Effects
  useEffect(() => {
    dispatch(fetchFollowedUsers());

    if (userId) {
      const userIdNumber = parseInt(userId, 10);
      dispatch(fetchUserProfileAndPosts(userIdNumber)).catch((error) => {
        console.error("Profile fetch error:", error);
      });
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
      dispatch(toggleFollow(selectedUser.id)).catch((error) => {
        console.error("Follow toggle error:", error);
      });
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

// Update the like handler to match working component
const handleLikeToggle = async (postId: string) => {
  try {
    await dispatch(toggleLike(parseInt(postId))).unwrap();
    // Remove the likedPosts state since we'll use Redux directly
  } catch (err) {
    console.error("Failed to toggle like:", err);
  }
};

// Remove the likedPosts state declaration
// Remove setLikedPosts from component

  const handleCommentSubmit = async (postId: string) => {
    const commentState = commentStates[postId];
    if (!commentState || !commentState.newComment.trim()) return;

    setCommentStates((prev) => ({
      ...prev,
      [postId]: { ...prev[postId], isSubmitting: true },
    }));

    try {
      await axios.post(
        `${API_URL}/posts/${postId}/comments/`,
        { text: commentState.newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCommentStates((prev) => ({
        ...prev,
        [postId]: { newComment: "", isCommenting: false, isSubmitting: false },
      }));
    } catch (err) {
      console.error("Failed to post comment:", err);
      setCommentStates((prev) => ({
        ...prev,
        [postId]: { ...prev[postId], isSubmitting: false },
      }));
    }
  };

  const handleCommentChange = (postId: string, value: string) => {
    setCommentStates((prev) => ({
      ...prev,
      [postId]: { ...(prev[postId] || {}), newComment: value },
    }));
  };

  const handleCommentToggle = (postId: string) => {
    setCommentStates((prev) => ({
      ...prev,
      [postId]: {
        ...(prev[postId] || { newComment: "", isSubmitting: false }),
        isCommenting: !prev[postId]?.isCommenting,
      },
    }));
  };

  const handleExpandPost = (postId: string) => {
    setExpandedPosts((prev) => [...prev, postId]);
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
            <PostItem
              key={post.id}
              post={post}
              user={selectedUser}
              currentUser={currentUser}
              likedPosts={likedPosts}
              commentStates={commentStates}
              onLikeToggle={handleLikeToggle}
              onCommentToggle={handleCommentToggle}
              onCommentSubmit={handleCommentSubmit}
              onCommentChange={handleCommentChange}
              expandedPosts={expandedPosts}
              onExpandPost={handleExpandPost}
            />
          ))
        ) : (
          <p className="text-center text-gray-500">No posts yet.</p>
        )}
      </div>
    </div>
  );
};

export default UserProfileView;