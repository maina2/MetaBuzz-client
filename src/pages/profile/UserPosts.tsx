import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserPosts,
  deletePost,
  editPost,
} from "../../redux/features/posts/postSlice";
import { RootState, AppDispatch } from "../../redux/store";
import { startConversation } from "../../redux/features/messages/messagesSlice";


const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/duknvsch4/";

interface EditState {
  [key: number]: string; // key = post id, value = edited content
}

const UserPosts = ({ userId }: { userId: number }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { userPosts, loading } = useSelector((state: RootState) => state.posts);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState<EditState>({});

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserPosts(userId));
    }
  }, [dispatch, userId]);

  const handleDelete = (postId: number) => {
    dispatch(deletePost(postId));
  };

  const handleEditClick = (postId: number, currentContent: string) => {
    setEditingPostId(postId);
    setEditContent({ ...editContent, [postId]: currentContent });
  };

  const handleEditChange = (postId: number, value: string) => {
    setEditContent({ ...editContent, [postId]: value });
  };

  const handleSaveEdit = (postId: number) => {
    const newContent = editContent[postId];
    if (newContent.trim()) {
      dispatch(editPost({ id: postId, content: newContent }));
      setEditingPostId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading your posts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Your Posts</h2>
        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
          {userPosts.length} {userPosts.length === 1 ? "Post" : "Posts"}
        </span>
      </div>

      {userPosts.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            ></path>
          </svg>
          <p className="text-gray-600 font-medium">You haven't posted anything yet.</p>
          <button className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition">
            Create your first post
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {userPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md"
            >
              <div className="p-5">
                {editingPostId === post.id ? (
                  <div className="space-y-4">
                    <textarea
                      value={editContent[post.id]}
                      onChange={(e) => handleEditChange(post.id, e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      rows={4}
                      placeholder="What's on your mind?"
                    />
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleSaveEdit(post.id)}
                        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-800 whitespace-pre-line">{post.content}</p>
                )}
              </div>

              {post.image && (
                <div className="border-t border-gray-100">
                  <img
                    src={`${CLOUDINARY_BASE_URL}${post.image}`}
                    alt="Post attachment"
                    className="w-full h-auto object-cover max-h-96"
                  />
                </div>
              )}

              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  Posted on {new Date(post.created_at).toLocaleDateString()} at{" "}
                  {new Date(post.created_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
                <div className="flex space-x-2">
                  {editingPostId !== post.id && (
                    <>
                      <button
                        onClick={() => handleEditClick(post.id, post.content)}
                        className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserPosts;