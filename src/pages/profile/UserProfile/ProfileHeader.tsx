import React from 'react';
import { UserProfile } from './types';

interface ProfileHeaderProps {
  user: UserProfile;
  isOwnProfile: boolean;
  isFollowing: boolean;
  followLoading: boolean;
  messageLoading: boolean;
  onToggleFollow: () => void;
  onMessage: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  isOwnProfile,
  isFollowing,
  followLoading,
  messageLoading,
  onToggleFollow,
  onMessage,
}) => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 p-6">
    <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
      {user.profile_picture ? (
        <img
          src={user.profile_picture}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
        />
      ) : (
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-md">
          {user.username?.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="flex-1 text-center md:text-left">
        <h1 className="text-2xl font-bold text-gray-800">
          {user.first_name && user.last_name
            ? `${user.first_name} ${user.last_name}`
            : user.username}
        </h1>

        {(user.first_name || user.last_name) && (
          <p className="text-sm text-gray-600 mt-1">@{user.username}</p>
        )}

        <p className="text-sm text-gray-600 mt-1">{user.email}</p>

        {user.bio && (
          <p className="text-sm text-gray-700 mt-2 italic">"{user.bio}"</p>
        )}

        <div className="flex justify-center md:justify-start space-x-6 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">{user.followers_count}</p>
            <p className="text-xs text-gray-500 uppercase">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">{user.following_count}</p>
            <p className="text-xs text-gray-500 uppercase">Following</p>
          </div>
        </div>

        {!isOwnProfile && (
          <div className="flex space-x-3 mt-4 justify-center md:justify-start">
            <button
              onClick={onToggleFollow}
              disabled={followLoading}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isFollowing
                  ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  : "bg-teal-500 text-white hover:bg-teal-600"
              }`}
            >
              {followLoading ? "Loading..." : isFollowing ? "Unfollow" : "Follow"}
            </button>

            <button
              onClick={onMessage}
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
);