import React from "react";
import { Comment, Post } from "./types";
import { formatDate } from "./utils";

interface CommentSectionProps {
  post: Post;
  currentUser?: { username: string };
  commentState?: {
    isCommenting: boolean;
    newComment: string;
    isSubmitting: boolean;
  };
  onSubmit: () => void;
  onCommentChange: (value: string) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  post,
  currentUser,
  commentState = {
    isCommenting: false,
    newComment: "",
    isSubmitting: false,
  },
  onSubmit,
  onCommentChange,
}) => (
  <div
    className={`px-5 py-3 transition-all duration-300 ${
      commentState.isCommenting
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
          <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
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
                <p className="text-gray-700 text-sm mt-1">{comment.text}</p>
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
            value={commentState.newComment}
            onChange={(e) => onCommentChange(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 py-2 bg-transparent text-sm focus:outline-none"
            disabled={commentState.isSubmitting}
          />
          <button
            onClick={onSubmit}
            disabled={!commentState.newComment.trim() || commentState.isSubmitting}
            className={`p-2 rounded-full transition-all ${
              !commentState.newComment.trim() || commentState.isSubmitting
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-500 hover:bg-blue-100"
            }`}
          >
            {commentState.isSubmitting ? (
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