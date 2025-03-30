import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import api from "../../../api/api"; // 👈 centralized Axios instance

const API_URL = "/posts"; // Base path only since api has baseURL

// Types
export interface Author {
  id: number;
  username: string;
}

export interface Post {
  id: number;
  content: string;
  image?: string;
  author: Author;
  created_at: string;
}

interface PostsState {
  posts: Post[];
  userPosts: Post[];
  searchResults: Post[];
  loading: boolean;
  error: string | null;
}

const initialState: PostsState = {
  posts: [],
  userPosts: [],
  searchResults: [],
  loading: false,
  error: null,
};

// -----------------------------
// Async Thunks
// -----------------------------

export const fetchPosts = createAsyncThunk<Post[], void, { state: RootState }>(
  "posts/fetchPosts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(API_URL);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || "Failed to fetch posts");
    }
  }
);

export const searchPosts = createAsyncThunk<Post[], string>(
  "posts/searchPosts",
  async (query, { rejectWithValue }) => {
    try {
      const response = await api.get(`${API_URL}/search/?q=${query}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || "Search failed");
    }
  }
);

export const createPost = createAsyncThunk<Post, { content: string; image?: File }>(
  "posts/createPost",
  async (postData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("content", postData.content);
      if (postData.image) {
        formData.append("image", postData.image);
      }

      const response = await api.post(`${API_URL}/`, formData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || "Failed to create post");
    }
  }
);

export const fetchUserPosts = createAsyncThunk<Post[], number>(
  "posts/fetchUserPosts",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`${API_URL}/user/${userId}/posts/`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || "Failed to fetch user posts");
    }
  }
);

export const editPost = createAsyncThunk<Post, { id: number; content: string }>(
  "posts/editPost",
  async ({ id, content }, { rejectWithValue }) => {
    try {
      const response = await api.put(`${API_URL}/user/${id}/`, { content });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || "Failed to edit post");
    }
  }
);

export const deletePost = createAsyncThunk<number, number>(
  "posts/deletePost",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`${API_URL}/user/${id}/`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || "Failed to delete post");
    }
  }
);

// Slice

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
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action: PayloadAction<Post[]>) => {
        state.posts = action.payload;
        state.loading = false;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchUserPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action: PayloadAction<Post[]>) => {
        state.userPosts = action.payload;
        state.loading = false;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(searchPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchPosts.fulfilled, (state, action: PayloadAction<Post[]>) => {
        state.searchResults = action.payload;
        state.loading = false;
      })
      .addCase(searchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createPost.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPost.fulfilled, (state, action: PayloadAction<Post>) => {
        state.posts.unshift(action.payload);
        state.loading = false;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(editPost.pending, (state) => {
        state.loading = true;
      })
      .addCase(editPost.fulfilled, (state, action: PayloadAction<Post>) => {
        const index = state.posts.findIndex((post) => post.id === action.payload.id);
        if (index !== -1) state.posts[index] = action.payload;
        state.loading = false;
      })
      .addCase(editPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(deletePost.fulfilled, (state, action: PayloadAction<number>) => {
        state.posts = state.posts.filter((post) => post.id !== action.payload);
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// Exports

export const { clearSearchResults } = postsSlice.actions;
export default postsSlice.reducer;
