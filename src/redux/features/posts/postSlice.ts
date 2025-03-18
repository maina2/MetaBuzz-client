import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Define API URL
const API_URL = "http://127.0.0.1:8000/api/posts"; // Adjust based on your Django backend

// Initial state
interface Post {
  id: number;
  content: string;
  image?: string;
  author: {
    id: number;
    username: string;
  };
  created_at: string;
}

interface PostsState {
  posts: Post[];
  searchResults: Post[];
  loading: boolean;
  error: string | null;
}

const initialState: PostsState = {
  posts: [],
  searchResults: [],
  loading: false,
  error: null,
};

// Fetch all posts
export const fetchPosts = createAsyncThunk("posts/fetchPosts", async (_, thunkAPI) => {
  try {
    const response = await axios.get(`${API_URL}/`);
    return response.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data?.detail || "Failed to fetch posts");
  }
});

// Search posts
export const searchPosts = createAsyncThunk(
  "posts/searchPosts",
  async (query: string, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/search/?q=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.detail || "Search failed");
    }
  }
);

// Create a new post
export const createPost = createAsyncThunk(
  "posts/createPost",
  async (postData: { content: string; image?: File }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("content", postData.content);
      if (postData.image) {
        formData.append("image", postData.image);
      }

      const response = await axios.post(`${API_URL}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.detail || "Failed to create post");
    }
  }
);

// Edit a post
export const editPost = createAsyncThunk(
  "posts/editPost",
  async ({ id, content }: { id: number; content: string }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/${id}/`,
        { content },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.detail || "Failed to edit post");
    }
  }
);

// Delete a post
export const deletePost = createAsyncThunk("posts/deletePost", async (id: number, thunkAPI) => {
  try {
    const token = localStorage.getItem("token");
    await axios.delete(`${API_URL}/${id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return id;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data?.detail || "Failed to delete post");
  }
});

// Posts slice
const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(searchPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createPost.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(editPost.pending, (state) => {
        state.loading = true;
      })
      .addCase(editPost.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.posts.findIndex((post) => post.id === action.payload.id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
      })
      .addCase(editPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((post) => post.id !== action.payload);
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearSearchResults } = postsSlice.actions;
export default postsSlice.reducer;
