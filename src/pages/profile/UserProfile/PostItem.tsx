import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../../../redux/store";
import { PostType } from "../../../types/PostType";
import { toggleLike } from "../../../redux/features/likes/likesSlice";
import { fetchComments, createComment } from "../../../redux/features/comments/commentsSlice";
import { CommentSection } from "./CommentSection";

interface PostItemProps {
  post: PostType;
  user: { 
    id: number;
    username: string; 
    profile_picture?: string 
  };
  currentUser?: { 
    username: string;
    id: number;
  };
  isExpanded: boolean;
  onExpandPost: () => void;
}

const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/duknvsch4/";

// Memoized selectors
const selectCommentsForPost = createSelector(
  [(state: RootState) => state.comments.commentsByPost, (state: RootState, postId: number) => postId],
  (commentsByPost, postId) => commentsByPost[postId] || []
);

const selectLikesForPost = createSelector(
  [(state: RootState) => state.likes.likes, (state: RootState, postId: number) => postId],
  (likes, postId) => likes[postId] || []
);

const selectCommentsLoading = (state: RootState) => state.comments.loading;

export const PostItem: React.FC<PostItemProps> = React.memo(({
  post,
  user,
  currentUser,
  isExpanded,
  onExpandPost,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const postId = post.id;

  // Redux selectors - using memoized selectors
  const comments = useSelector((state: RootState) => selectCommentsForPost(state, postId));
  const likes = useSelector((state: RootState) => selectLikesForPost(state, postId));
  const commentsLoading = useSelector(selectCommentsLoading);

  const isLikedByUser = useMemo(() => {
    if (!currentUser) return false;
    return likes.some(like => like.user === currentUser.username);
  }, [likes, currentUser]);

  // Fetch comments and likes on mount
  useEffect(() => {
    if (currentUser) {
      dispatch(fetchComments(postId));
    }
  }, [dispatch, postId, currentUser]);

  const handleLikeToggle = useCallback(() => {
    if (currentUser) {
      dispatch(toggleLike(postId));
    }
  }, [dispatch, postId, currentUser]);

  const handleCommentToggle = useCallback(() => {
    setIsCommenting(prev => !prev);
  }, []);

  const formatDate = useCallback((dateString: string) => {
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
    }
    return date.toLocaleDateString();
  }, []);

  const imageUrl = useMemo(() => 
    post.image ? `${CLOUDINARY_BASE_URL}${post.image}` : null, 
    [post.image]
  );

  return (
    <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
      {/* Post Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-full overflow-hidden shadow-sm">
            {user.profile_picture ? (
              <img
                src={user.profile_picture}
                alt={user.username}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-teal-400 to-blue-400 flex items-center justify-center text-white font-bold text-lg">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <Link
              to={`/profile/${user.id}`}
              className="font-semibold text-gray-800 hover:text-teal-500 transition-colors"
            >
              {user.username}
            </Link>
            <p className="text-xs text-gray-500">{formatDate(post.created_at)}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {/* Post Content */}
      <div className="px-5 py-4">
        <p className={`text-gray-800 whitespace-pre-line leading-relaxed ${isExpanded ? "" : "line-clamp-3"}`}>
          {post.content}
        </p>
        {post.content.length > 200 && !isExpanded && (
          <button
            onClick={onExpandPost}
            className="text-blue-500 hover:text-blue-600 text-sm mt-2"
          >
            See more
          </button>
        )}
      </div>

      {/* Post Image */}
      {imageUrl && (
        <div className="w-full px-5 pb-3">
          <img
            src={imageUrl}
            alt="Post content"
            className="w-full object-cover max-h-96 rounded-lg shadow-sm"
            loading="lazy"
          />
        </div>
      )}

      {/* Post Stats */}
      <div className="flex items-center justify-between px-5 py-2 text-sm text-gray-500 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-1">
            {likes.length > 0 && (
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
            )}
          </div>
          <span>
            {likes.length > 0
              ? `${likes.length} ${likes.length === 1 ? "like" : "likes"}`
              : "Be the first to like"}
          </span>
        </div>
        <div>
          {comments.length > 0 && (
            <span>
              {comments.length} {comments.length === 1 ? "comment" : "comments"}
            </span>
          )}
        </div>
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-around px-2 py-1 border-t border-b border-gray-100">
        <button
          onClick={handleLikeToggle}
          className={`flex items-center justify-center space-x-1 py-2 px-4 rounded-md transition-colors w-1/2 ${
            isLikedByUser
              ? "text-red-500 bg-red-50"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={isLikedByUser ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={isLikedByUser ? "0" : "1.5"}
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
          <span className="font-medium">
            {isLikedByUser ? "Liked" : "Like"}
          </span>
        </button>
        <button
          onClick={handleCommentToggle}
          className={`flex items-center justify-center space-x-1 py-2 px-4 rounded-md transition-colors w-1/2 ${
            isCommenting
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
      <div className={`transition-all duration-300 ${isCommenting ? "block" : "hidden"}`}>
        <CommentSection 
          postId={postId}
          comments={comments} 
          currentUser={currentUser} 
          loading={commentsLoading}
        />
      </div>
    </div>
  );
});

export default PostItem;