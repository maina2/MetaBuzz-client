import React from "react";
import { Post } from "./types";
import { CommentSection } from "./CommentSection";
import { formatDate } from "./utils";

interface PostItemProps {
  post: Post;
  user: { username: string; profile_picture?: string };
  currentUser?: { username: string };
  likedPosts: string[];
  commentStates: {
    [postId: string]: {
      isCommenting: boolean;
      newComment: string;
      isSubmitting: boolean;
    };
  };
  onLikeToggle: (postId: string) => void;
  onCommentToggle: (postId: string) => void;
  onCommentSubmit: (postId: string) => void;
  onCommentChange: (postId: string, value: string) => void;
  expandedPosts: string[];
  onExpandPost: (postId: string) => void;
}

export const PostItem: React.FC<PostItemProps> = ({
  post,
  user,
  currentUser,
  likedPosts,
  commentStates,
  onLikeToggle,
  onCommentToggle,
  onCommentSubmit,
  onCommentChange,
  expandedPosts,
  onExpandPost,
}) => {
  const commentState = commentStates[post.id] || {
    isCommenting: false,
    newComment: "",
    isSubmitting: false,
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
      {/* Post Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          {user.profile_picture ? (
            <img
              src={user.profile_picture}
              alt={user.username}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-teal-400 to-blue-400 flex items-center justify-center text-white font-bold text-lg">
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-800">{user.username}</p>
            <p className="text-xs text-gray-500">{formatDate(post.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-5 py-4">
        <p className={`text-gray-800 ${expandedPosts.includes(post.id) ? "" : "line-clamp-3"}`}>
          {post.content}
        </p>
        {post.content.length > 200 && !expandedPosts.includes(post.id) && (
          <button
            onClick={() => onExpandPost(post.id)}
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
          onClick={() => onLikeToggle(post.id)}
          className={`flex items-center justify-center space-x-1 py-2 px-4 rounded-md transition-colors w-1/2 ${
            likedPosts.includes(post.id)
              ? "text-red-500 bg-red-50"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={likedPosts.includes(post.id) ? "currentColor" : "none"}
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
          onClick={() => onCommentToggle(post.id)}
          className={`flex items-center justify-center space-x-1 py-2 px-4 rounded-md transition-colors w-1/2 ${
            commentState.isCommenting
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

      {/* Comment Section */}
      <CommentSection
        post={post}
        currentUser={currentUser}
        commentState={commentState}
        onSubmit={() => onCommentSubmit(post.id)}
        onCommentChange={(value) => onCommentChange(post.id, value)}
      />
    </div>
  );
};