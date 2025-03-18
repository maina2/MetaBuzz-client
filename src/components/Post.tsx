import { PostType } from "../types";
import { Link } from "react-router-dom";

interface PostProps {
  post: PostType;
}

const Post = ({ post }: PostProps) => {
  return (
    <div className="border p-4 rounded-lg mb-4 shadow-sm bg-white">
      <div className="flex items-center space-x-2">
        <p className="font-semibold">{post.user.username}</p>
        <span className="text-sm text-gray-500">{new Date(post.created_at).toLocaleDateString()}</span>
      </div>
      <p className="mt-2">{post.content}</p>

      <div className="flex space-x-4 mt-3 text-sm text-gray-500">
        <button>👍 {post.likes_count} Likes</button>
        <Link to={`/post/${post.id}`} className="hover:underline">
          💬 {post.comments_count} Comments
        </Link>
      </div>
    </div>
  );
};

export default Post;
