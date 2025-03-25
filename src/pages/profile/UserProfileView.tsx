import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { fetchUserProfileAndPosts } from "../../redux/features/profile/profileSlice";
import { toggleFollow, fetchFollowedUsers } from "../../redux/features/follow/followSlice";

// Define types based on your existing code
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
  id: number;
  content: string;
  created_at: string;
  user: {
    id: number;
    username: string;
    profile_picture?: string;
  };
}

const UserProfileView: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const dispatch = useDispatch<AppDispatch>();

  const { selectedUser, userPosts, loading: profileLoading, error: profileError } = useSelector(
    (state: RootState) => state.profile
  );
  const { 
    followedUsers, 
    loading: followLoading, 
    error: followError 
  } = useSelector((state: RootState) => state.follow);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [isFollowing, setIsFollowing] = useState(false);

  // Fetch profile, posts, and followed users on component mount
  useEffect(() => {
    // Fetch followed users when component mounts
    dispatch(fetchFollowedUsers());

    if (userId) {
      const userIdNumber = parseInt(userId, 10);
      dispatch(fetchUserProfileAndPosts(userIdNumber))
        .catch((error) => {
          console.error("Profile fetch error:", error);
        });
    }
  }, [dispatch, userId]);

  // Update following status when selectedUser or followedUsers change
  useEffect(() => {
    if (selectedUser && followedUsers) {
      // Check if the current user's ID is in the followed users list
      setIsFollowing(followedUsers.includes(selectedUser.id));
    }
  }, [selectedUser, followedUsers]);

  // Handle follow/unfollow action
  const handleToggleFollow = () => {
    if (selectedUser) {
      dispatch(toggleFollow(selectedUser.id))
        .then(() => {
          // Optional: You might want to update followers count or do additional actions
        })
        .catch((error) => {
          console.error("Follow toggle error:", error);
        });
    }
  };

  // Loading and error states
  if (profileLoading) {
    return (
      <div className="text-center py-8">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (profileError || followError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">
          {profileError || followError || "An error occurred"}
        </p>
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="text-center py-8">
        <p>User not found</p>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.id === selectedUser.id;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Profile Image or Initial */}
        {selectedUser.profile_picture ? (
          <div className="relative">
            <img
              src={selectedUser.profile_picture}
              alt="Profile"
              className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-white shadow-md"
            />
          </div>
        ) : (
          <div className="relative">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-md">
              {selectedUser.username?.charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        {/* User Information */}
        <div className="flex-1 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {selectedUser.username}
              </h1>
              <p className="text-sm text-gray-500 flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  ></path>
                </svg>
                {selectedUser.email}
              </p>
              {(selectedUser.first_name || selectedUser.last_name) && (
                <p className="text-gray-700">
                  {selectedUser.first_name} {selectedUser.last_name}
                </p>
              )}
            </div>

            {/* Follow/Unfollow Button */}
            {!isOwnProfile && (
              <div className="mt-3 md:mt-0">
                <button
                  onClick={handleToggleFollow}
                  disabled={followLoading}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isFollowing
                      ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      : "bg-teal-500 text-white hover:bg-teal-600"
                  }`}
                >
                  {followLoading ? (
                    <span>Loading...</span>
                  ) : isFollowing ? (
                    <span>Unfollow</span>
                  ) : (
                    <span>Follow</span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex space-x-6 pt-2">
            <div className="text-center px-3 py-1 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-800">
                {selectedUser.followers_count || 0}
              </p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Followers
              </p>
            </div>
            <div className="text-center px-3 py-1 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-800">
                {selectedUser.following_count || 0}
              </p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Following
              </p>
            </div>
          </div>

          {/* Bio and Phone */}
          <div className="pt-2 space-y-2">
            {selectedUser.bio ? (
              <p className="text-gray-700">{selectedUser.bio}</p>
            ) : (
              <p className="text-gray-400 italic">No bio provided</p>
            )}

            {selectedUser.phone && (
              <p className="text-sm text-gray-600 flex items-center">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  ></path>
                </svg>
                {selectedUser.phone}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* User's Posts */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Posts</h2>
        {userPosts && userPosts.length > 0 ? (
          <div className="space-y-4">
            {userPosts.map((post) => (
              <div
                key={post.id}
                className="p-4 bg-white rounded-lg shadow-sm border border-gray-100"
              >
                <div className="flex items-center mb-2">
                  {post.user.profile_picture ? (
                    <img
                      src={post.user.profile_picture}
                      alt={`${post.user.username}'s profile`}
                      className="w-10 h-10 rounded-full object-cover mr-3"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold text-white mr-3">
                      {post.user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-800">
                      {post.user.username}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700">{post.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No posts yet.</p>
        )}
      </div>
    </div>
  );
};

export default UserProfileView;