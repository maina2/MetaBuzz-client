import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { fetchPosts } from "../../redux/features/posts/postSlice";
import Post from "../../components/Post";
import CreatePost from "../../components/CreatePost"; // Import CreatePost component

const Home = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { posts, loading, error } = useSelector((state: RootState) => state.posts);
  
  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">Home Feed</h1>

      {/* Create Post Component */}
      <CreatePost />

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading posts...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="space-y-6 w-full">
        {posts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </div>

      {!loading && posts.length === 0 && !error && (
        <div className="text-center py-10 text-gray-500">
          No posts available. Follow more users to see their updates!
        </div>
      )}
    </div>
  );
};

export default Home;
