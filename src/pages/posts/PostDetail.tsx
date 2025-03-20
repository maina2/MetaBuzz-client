import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";

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
  user: { id: string; username: string; image?: string };
  likes: number;
  created_at: string;
  comments: Comment[];
}

const API_URL = "http://127.0.0.1:8000/posts";
const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/duknvsch4/";

const PostDetail = () => {
  const { postId } = useParams(); // Get the post ID from the URL
  const token = useSelector((state: any) => state.auth.token); // Get auth token from Redux state
  const authUser = useSelector((state: any) => state.auth.user);
  
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);

  // Format date with relative time
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return diffMinutes === 0 ? 'Just now' : `${diffMinutes}m ago`;
      }
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`${API_URL}/${postId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPost(response.data);
        // Check if the current user liked this post
        // This is a placeholder - you might have a different way to check this
        setIsLiked(false); // Set based on actual data
      } catch (err) {
        setError("Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, token]);

  // Handle Comment Submission
  const handleCommentSubmit = async () => {
    if (!newComment.trim() || isSubmitting || !post) return;
    setIsSubmitting(true);

    try {
      // Post the comment to your API
      const response = await axios.post(
        `${API_URL}/${post.id}/comments/`,
        { text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Add the new comment to the post
      setPost(prev => {
        if (!prev) return prev;
        const updatedComments = [...(prev.comments || []), response.data];
        return { ...prev, comments: updatedComments };
      });

      setNewComment("");
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Like Toggle
  const handleLikeToggle = async () => {
    if (!post) return;

    // Toggle like state optimistically
    setIsLiked(prev => !prev);
    
    try {
      // Send like/unlike request to API
      await axios.post(
        `${API_URL}/${post.id}/likes/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update post likes count
      setPost(prev => {
        if (!prev) return prev;
        const likesCount = isLiked ? prev.likes - 1 : prev.likes + 1;
        return { ...prev, likes: likesCount };
      });
    } catch (err) {
      // Revert on error
      setIsLiked(prev => !prev);
      console.error("Failed to toggle like:", err);
    }
  };

  if (loading) return <div className="text-center py-5">Loading post...</div>;
  if (error) return <div className="text-center py-5 text-red-500">{error}</div>;
  if (!post) return <div className="text-center py-5">Post not found.</div>;

  const imageUrl = post.image ? `${CLOUDINARY_BASE_URL}${post.image}` : null;
  const comments = post.comments || [];
  
  // Display only some comments by default
  const displayedComments = showAllComments 
    ? comments 
    : comments.slice(0, 2);

  return (
    <div className="max-w-2xl mx-auto my-6">
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
        {/* Post Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            {post.user.image ? (
              <img
                src={post.user.image}
                alt={post.user.username}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-teal-400 to-blue-400 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                {post.user.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <Link to={`/profile/${post.user.username}`} className="font-semibold text-gray-800 hover:text-teal-500 transition-colors">
                {post.user.username}
              </Link>
              <p className="text-xs text-gray-500">{formatDate(post.created_at)}</p>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>

        {/* Post Content */}
        <div className="px-5 py-4">
          <p className="text-gray-800 whitespace-pre-line leading-relaxed">{post.content}</p>
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
            {post.likes > 0 && (
              <div className="flex -space-x-1">
                <div className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
            <span>{post.likes > 0 ? `${post.likes} ${post.likes === 1 ? 'like' : 'likes'}` : 'Be the first to like'}</span>
          </div>
          <div>
            {comments.length > 0 && (
              <span>{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</span>
            )}
          </div>
        </div>

        {/* Post Actions */}
        <div className="flex items-center justify-around px-2 py-1 border-t border-b border-gray-100">
          <button 
            onClick={handleLikeToggle} 
            className={`flex items-center justify-center space-x-1 py-2 px-4 rounded-md transition-colors w-1/2 ${
              isLiked ? "text-red-500 bg-red-50" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill={isLiked ? "currentColor" : "none"} 
              stroke="currentColor" 
              strokeWidth={isLiked ? "0" : "1.5"} 
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            <span className="font-medium">{isLiked ? 'Liked' : 'Like'}</span>
          </button>
          <button 
            onClick={() => setIsCommenting(!isCommenting)}
            className={`flex items-center justify-center space-x-1 py-2 px-4 rounded-md transition-colors w-1/2 ${
              isCommenting ? "text-blue-500 bg-blue-50" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="font-medium">Comment</span>
          </button>
        </div>

        {/* Comments Section */}
        <div className={`px-5 py-3 transition-all duration-300 ${isCommenting ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          {/* Comments List */}
          {comments.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No comments yet. Be the first to comment!</p>
          ) : (
            <div className="space-y-3 mb-4">
              {displayedComments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center text-white font-medium text-xs flex-shrink-0">
                      {comment.user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <Link to={`/profile/${comment.user.username}`} className="font-medium text-gray-800 hover:text-blue-500 transition-colors text-sm">
                          {comment.user.username}
                        </Link>
                        <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                      </div>
                      <p className="text-gray-700 text-sm mt-1">{comment.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Show More Comments */}
          {comments.length > 2 && !showAllComments && (
            <button 
              onClick={() => setShowAllComments(true)}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium mb-3 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              View all {comments.length} comments
            </button>
          )}

          {/* Add a Comment (Only for Authenticated Users) */}
          {authUser && (
            <div className="flex items-start space-x-2 mt-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-teal-400 to-blue-400 flex items-center justify-center text-white font-medium text-xs flex-shrink-0">
                {authUser.username.charAt(0).toUpperCase()}
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
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;