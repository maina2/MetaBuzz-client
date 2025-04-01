import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { searchPosts, clearSearchResults } from "../redux/features/posts/postSlice";

const SearchComponent = () => {
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState("");

  const searchResults = useAppSelector((state) => state.posts.searchResults);

  const handleSearch = () => {
    if (query.trim() !== "") {
      dispatch(clearSearchResults()); 
      dispatch(searchPosts(query));
    }
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-md">
      <input
        type="text"
        placeholder="Search posts..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleSearch}
        className="mt-2 w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
      >
        Search
      </button>

      {searchResults.length > 0 ? (
        <ul className="mt-4 max-h-48 overflow-y-auto border rounded-md p-2">
          {searchResults.slice(0, 5).map((post) => (
            <li key={post.id} className="p-2 border-b text-gray-700">
              {post.content}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 mt-2">No results found.</p>
      )}
    </div>
  );
};

export default SearchComponent;
