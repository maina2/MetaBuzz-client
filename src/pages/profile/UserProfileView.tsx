import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../../redux/store";
import { fetchUserProfileAndPosts } from "../../redux/features/profile/profileSlice";
import {
  toggleFollow,
  fetchFollowedUsers,
} from "../../redux/features/follow/followSlice";
import { startConversation } from "../../redux/features/messages/messagesSlice";

// Define types with optional chaining and default values
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

  // Selectors with default values
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

  // State hooks
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
  const handleMessage = async () => {
    if (!selectedUser?.id) return;
    setMessageLoading(true);
    try {
      const result = await dispatch(
        startConversation(selectedUser.id)
      ).unwrap();
      navigate(`/conversation/${result.id}`);
    } catch (err) {
      console.error("Failed to start conversation:", err);
    } finally {
      setMessageLoading(false);
    }
  };

  // Utility function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return diffMinutes === 0 ? "Just now" : `${diffMinutes}m ago`;
      }
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Fetch user profile and followed users
  useEffect(() => {
    dispatch(fetchFollowedUsers());

    if (userId) {
      const userIdNumber = parseInt(userId, 10);
      dispatch(fetchUserProfileAndPosts(userIdNumber)).catch((error) => {
        console.error("Profile fetch error:", error);
      });
    }
  }, [dispatch, userId]);

  // Update following status
  useEffect(() => {
    if (selectedUser && followedUsers) {
      setIsFollowing(followedUsers.some((id) => id === selectedUser.id));
    }
  }, [selectedUser, followedUsers]);

  // Handle Follow/Unfollow
  const handleToggleFollow = () => {
    if (selectedUser) {
      dispatch(toggleFollow(selectedUser.id)).catch((error) => {
        console.error("Follow toggle error:", error);
      });
    }
  };

  // Handle Post Like
  const handleLikeToggle = async (postId: string) => {
    try {
      await axios.post(
        `${API_URL}/posts/${postId}/likes/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLikedPosts((prev) =>
        prev.includes(postId)
          ? prev.filter((id) => id !== postId)
          : [...prev, postId]
      );
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  // Handle Comment Submission
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

      // Reset comment state
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

  // Render loading or error states
  if (profileLoading)
    return <div className="text-center py-5">Loading profile...</div>;
  if (profileError || followError)
    return (
      <div className="text-center py-5 text-red-500">
        {profileError || followError}
      </div>
    );
  if (!selectedUser)
    return <div className="text-center py-5">User not found</div>;

  const isOwnProfile = currentUser && currentUser.id === selectedUser.id;

  return (
    <div className="max-w-2xl mx-auto my-6 space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
          {selectedUser.profile_picture ? (
            <img
              src={selectedUser.profile_picture}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-md">
              {selectedUser.username?.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold text-gray-800">
              {selectedUser.first_name && selectedUser.last_name
                ? `${selectedUser.first_name} ${selectedUser.last_name}`
                : selectedUser.username}
            </h1>

            {/* Username */}
            {(selectedUser.first_name || selectedUser.last_name) && (
              <p className="text-sm text-gray-600 mt-1">
                @{selectedUser.username}
              </p>
            )}

            {/* Email */}
            <p className="text-sm text-gray-600 mt-1">{selectedUser.email}</p>

            {/* Bio */}
            {selectedUser.bio && (
              <p className="text-sm text-gray-700 mt-2 italic">
                "{selectedUser.bio}"
              </p>
            )}

            <div className="flex justify-center md:justify-start space-x-6 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800">
                  {selectedUser.followers_count}
                </p>
                <p className="text-xs text-gray-500 uppercase">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800">
                  {selectedUser.following_count}
                </p>
                <p className="text-xs text-gray-500 uppercase">Following</p>
              </div>
            </div>

            {!isOwnProfile && (
              <div className="flex space-x-3 mt-4 justify-center md:justify-start">
                <button
                  onClick={handleToggleFollow}
                  disabled={followLoading}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    isFollowing
                      ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      : "bg-teal-500 text-white hover:bg-teal-600"
                  }`}
                >
                  {followLoading
                    ? "Loading..."
                    : isFollowing
                    ? "Unfollow"
                    : "Follow"}
                </button>

                <button
                  onClick={handleMessage}
                  disabled={messageLoading}
                  className="px-6 py-2 rounded-lg bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors"
                >
                  {messageLoading ? "Loading..." : "Message"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-800">Posts</h2>
        {userPosts.length > 0 ? (
          userPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              {/* Post Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  {selectedUser.profile_picture ? (
                    <img
                      src={selectedUser.profile_picture}
                      alt={selectedUser.username}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-teal-400 to-blue-400 flex items-center justify-center text-white font-bold text-lg">
                      {selectedUser.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-800">
                      {selectedUser.username}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(post.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="px-5 py-4">
                <p
                  className={`text-gray-800 ${
                    expandedPosts.includes(post.id) ? "" : "line-clamp-3"
                  }`}
                >
                  {post.content}
                </p>
                {post.content.length > 200 &&
                  !expandedPosts.includes(post.id) && (
                    <button
                      onClick={() =>
                        setExpandedPosts((prev) => [...prev, post.id])
                      }
                      className="text-blue-500 hover:text-blue-600 text-sm mt-2"
                    >
                      See more
                    </button>
                  )}
              </div>

              {/* Post Image */}
              {post.image && (
                <div className="px-5 pb-3">
                  <img
                    src={post.image}
                    alt="Post content"
                    className="w-full object-cover max-h-96 rounded-lg shadow-sm"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Post Stats */}
              <div className="flex items-center justify-between px-5 py-2 text-sm text-gray-500 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  {post.likes > 0 && (
                    <div className="flex -space-x-1">
                      <div className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-white">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                  <span>
                    {post.likes > 0
                      ? `${post.likes} ${post.likes === 1 ? "like" : "likes"}`
                      : "Be the first to like"}
                  </span>
                </div>
                <div>
                  {post.comments && post.comments.length > 0 && (
                    <span>
                      {post.comments.length}{" "}
                      {post.comments.length === 1 ? "comment" : "comments"}
                    </span>
                  )}
                </div>
              </div>

              {/* Post Actions */}
              <div className="flex items-center justify-around px-2 py-1 border-t border-b border-gray-100">
                <button
                  onClick={() => handleLikeToggle(post.id)}
                  className={`flex items-center justify-center space-x-1 py-2 px-4 rounded-md transition-colors w-1/2 ${
                    likedPosts.includes(post.id)
                      ? "text-red-500 bg-red-50"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill={
                      likedPosts.includes(post.id) ? "currentColor" : "none"
                    }
                    stroke="currentColor"
                    strokeWidth={likedPosts.includes(post.id) ? "0" : "1.5"}
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                    />
                  </svg>
                  <span className="font-medium">
                    {likedPosts.includes(post.id) ? "Liked" : "Like"}
                  </span>
                </button>
                <button
                  onClick={() =>
                    setCommentStates((prev) => ({
                      ...prev,
                      [post.id]: {
                        ...prev[post.id],
                        isCommenting: !prev[post.id]?.isCommenting,
                      },
                    }))
                  }
                  className={`flex items-center justify-center space-x-1 py-2 px-4 rounded-md transition-colors w-1/2 ${
                    commentStates[post.id]?.isCommenting
                      ? "text-blue-500 bg-blue-50"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <span className="font-medium">Comment</span>
                </button>
              </div>

              {/* Comments Section */}
              <div
                className={`px-5 py-3 transition-all duration-300 ${
                  commentStates[post.id]?.isCommenting
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0 overflow-hidden"
                }`}
              >
                {/* Comments List */}
                {!post.comments || post.comments.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">
                    No comments yet. Be the first to comment!
                  </p>
                ) : (
                  <div className="space-y-3 mb-4">
                    {post.comments.slice(0, 2).map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-gray-50 p-3 rounded-lg"
                      >
                        <div className="flex items-start space-x-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center text-white font-medium text-xs flex-shrink-0">
                            {comment.user.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <p className="font-medium text-gray-800 text-sm">
                                {comment.user.username}
                              </p>
                              <span className="text-xs text-gray-500">
                                {formatDate(comment.created_at)}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm mt-1">
                              {comment.text}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add a Comment */}
                {currentUser && (
                  <div className="flex items-start space-x-2 mt-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-teal-400 to-blue-400 flex items-center justify-center text-white font-medium text-xs flex-shrink-0">
                      {currentUser.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-2xl p-1 pl-3 flex items-center">
                      <input
                        type="text"
                        value={commentStates[post.id]?.newComment || ""}
                        onChange={(e) =>
                          setCommentStates((prev) => ({
                            ...prev,
                            [post.id]: {
                              ...prev[post.id],
                              newComment: e.target.value,
                            },
                          }))
                        }
                        placeholder="Write a comment..."
                        className="flex-1 py-2 bg-transparent text-sm focus:outline-none"
                        disabled={commentStates[post.id]?.isSubmitting}
                      />
                      <button
                        onClick={() => handleCommentSubmit(post.id)}
                        disabled={
                          !commentStates[post.id]?.newComment?.trim() ||
                          commentStates[post.id]?.isSubmitting
                        }
                        className={`p-2 rounded-full transition-all ${
                          !commentStates[post.id]?.newComment?.trim() ||
                          commentStates[post.id]?.isSubmitting
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-blue-500 hover:bg-blue-100"
                        }`}
                      >
                        {commentStates[post.id]?.isSubmitting ? (
                          <svg
                            className="animate-spin h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
