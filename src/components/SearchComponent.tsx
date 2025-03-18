import { useDispatch, useSelector } from "react-redux";
import { searchPosts, clearSearchResults } from "../redux/features/posts/postSlice";
import { useState } from "react";

const SearchComponent = () => {
  const dispatch = useDispatch();
  const [query, setQuery] = useState("");
  const searchResults = useSelector((state: any) => state.posts.searchResults);

  const handleSearch = () => {
    if (query.trim() !== "") {
      dispatch(searchPosts(query));
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search posts..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>

      <ul>
        {searchResults.map((post: any) => (
          <li key={post.id}>{post.content}</li>
        ))}
      </ul>
    </div>
  );
};

export default SearchComponent;
