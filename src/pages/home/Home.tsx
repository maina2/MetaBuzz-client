import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { fetchPosts } from "../../redux/features/posts/postSlice";
import Post from "../../components/Post";

const Home = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { posts, loading, error } = useSelector((state: RootState) => state.posts);

  useEffect(() => {
    dispatch(fetchPosts()); // Fetch posts when page loads
  }, [dispatch]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Home Feed</h1>

      {loading && <p>Loading posts...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div>
        {posts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Home;
