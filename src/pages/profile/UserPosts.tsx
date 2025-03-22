import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserPosts,
  deletePost,
  editPost,
} from "../../redux/slices/postsSlice";
import { RootState, AppDispatch } from "../../redux/store";

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

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-2">Your Posts</h2>

      {loading ? (
        <p className="text-gray-500">Loading your posts...</p>
      ) : userPosts.length === 0 ? (
        <p className="text-gray-500">You haven't posted anything yet.</p>
      ) : (
        userPosts.map((post) => (
          <div
            key={post.id}
            className="bg-white p-4 rounded shadow-md space-y-2 border"
          >
            {editingPostId === post.id ? (
              <textarea
                value={editContent[post.id]}
                onChange={(e) => handleEditChange(post.id, e.target.value)}
                className="w-full p-2 border rounded"
                rows={3}
              />
            ) : (
              <p>{post.content}</p>
            )}

            {post.image && (
              <img
                src={post.image}
                alt="Post"
                className="w-full h-auto rounded"
              />
            )}

            <div className="flex gap-4 text-sm mt-2">
              {editingPostId === post.id ? (
                <button
                  onClick={() => handleSaveEdit(post.id)}
                  className="text-green-600 hover:underline"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={() => handleEditClick(post.id, post.content)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
              )}

              <button
                onClick={() => handleDelete(post.id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Posted on {new Date(post.created_at).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default UserPosts;
