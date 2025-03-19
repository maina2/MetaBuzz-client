import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchComments, createComment } from "../redux/features/comments/commentsSlice";
import { PostType } from "../types/PostType";

interface PostProps {
  post: PostType;
}

const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/duknvsch4/";

const Post = ({ post }: PostProps) => {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user); // Authenticated user

  // ✅ Memoized selector to avoid re-render issues
  const comments = useAppSelector((state) => state.comments.commentsByPost[post.id]) || [];
  const memoizedComments = useMemo(() => comments, [comments]);

  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Fetch comments only if user is authenticated
  useEffect(() => {
    if (authUser) {
      dispatch(fetchComments(post.id));
    }
  }, [dispatch, post.id, authUser]);

  // ✅ Handle Comment Submission
  const handleCommentSubmit = async () => {
    if (!newComment.trim() || isSubmitting) return;
    setIsSubmitting(true);

    await dispatch(createComment({ postId: post.id, text: newComment }));

    setNewComment("");
    setIsSubmitting(false);
  };

  const imageUrl = post.image ? `${CLOUDINARY_BASE_URL}${post.image}` : null;

  return (
    <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Post Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#72f8d2]">
        <div className="flex items-center space-x-2">
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 font-medium">{post.user.charAt(0)}</span>
          </div>
          <Link to={`/profile/${post.user}`} className="font-medium text-gray-800 hover:underline">
            {post.user}
          </Link>
        </div>
        <span className="text-sm text-gray-500">
          {new Date(post.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* Post Content */}
      <div className="px-4 py-3">
        <p className="text-gray-800 whitespace-pre-line">{post.content}</p>
      </div>

      {/* Post Image */}
      {imageUrl && (
        <div className="w-full">
          <img 
            src={imageUrl} 
            alt="Post content" 
            className="w-full object-cover max-h-96"
            loading="lazy"
          />
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center justify-between px-4 py-3 ">
        <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-500 transition-colors">
          <span>👍</span>
          <span>{post.likes_count} Likes</span>
        </button>
        <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-500 transition-colors">
          <span>💬</span>
          <span>{memoizedComments.length} Comments</span>
        </button>
      </div>

      {/* Comments Section */}
      <div className="px-4 py-2 border-t border-gray-300">
        <h3 className="font-semibold text-gray-700">Comments</h3>
        
        {memoizedComments.length === 0 ? (
          <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
        ) : (
          <div className="mt-2">
            {memoizedComments.map((comment) => (
              <div key={comment.id} className="border-b py-2">
                <p className="text-sm text-gray-700">
                  <strong>{comment.user}:</strong> {comment.text}
                </p>
                <span className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

        {/* Add a Comment (Only for Authenticated Users) */}
        {authUser && (
          <div className="mt-3 flex items-center space-x-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-3 py-2 border rounded-md"
              disabled={isSubmitting}
            />
            <button
              onClick={handleCommentSubmit}
              className={`px-3 py-2 rounded-md transition ${
                isSubmitting ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Posting..." : "Comment"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Post;
