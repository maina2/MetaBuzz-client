import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../redux/store";
import { createComment } from "../../../redux/features/comments/commentsSlice";

interface Comment {
  id: number;
  post: number;
  user: string;
  text: string;
  created_at: string;
}

interface CommentSectionProps {
  postId: number;
  comments: Comment[];
  currentUser?: { 
    username: string;
    id: number;
  };
  loading: boolean;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  comments,
  currentUser,
  loading
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [newComment, setNewComment] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !currentUser) return;
    setIsSubmitting(true);
    
    try {
      await dispatch(
        createComment({ 
          postId, 
          text: newComment 
        })
      ).unwrap();
      
      setNewComment("");
    } catch (error) {
      console.error("Failed to submit comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
    }
    return date.toLocaleDateString();
  };

  const displayedComments = showAllComments ? comments : comments.slice(0, 2);

  if (loading && comments.length === 0) {
    return (
      <div className="px-5 py-4 text-center">
        <div className="animate-pulse flex justify-center">
          <div className="h-5 w-5 bg-blue-200 rounded-full mr-2"></div>
          <div className="h-5 w-5 bg-blue-300 rounded-full mr-2"></div>
          <div className="h-5 w-5 bg-blue-400 rounded-full"></div>
        </div>
        <p className="text-gray-500 text-sm mt-2">Loading comments...</p>
      </div>
    );
  }

  return (
    <div className="px-5 py-3">
      {comments.length === 0 ? (
        <p className="text-gray-500 text-sm italic">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div className="space-y-3 mb-4">
          {displayedComments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-start space-x-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center text-white font-medium text-xs flex-shrink-0">
                  {comment.user.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-gray-800 text-sm">
                      {comment.user}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm mt-1">{comment.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {comments.length > 2 && !showAllComments && (
        <button
          onClick={() => setShowAllComments(true)}
          className="text-blue-500 hover:text-blue-600 text-sm font-medium mb-3 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
          View all {comments.length} comments
        </button>
      )}

      {currentUser && (
        <div className="flex items-start space-x-2 mt-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-teal-400 to-blue-400 flex items-center justify-center text-white font-medium text-xs flex-shrink-0">
            {currentUser.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 bg-gray-50 rounded-2xl p-1 pl-3 flex items-center">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 py-2 bg-transparent text-sm focus:outline-none"
              disabled={isSubmitting}
            />
            <button
              onClick={handleCommentSubmit}
              disabled={!newComment.trim() || isSubmitting}
              className={`p-2 rounded-full transition-all ${
                !newComment.trim() || isSubmitting
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-blue-500 hover:bg-blue-100"
              }`}
            >
              {isSubmitting ? (
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
  );
};