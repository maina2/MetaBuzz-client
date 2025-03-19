import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../../store";

const API_URL = "http://127.0.0.1:8000/interactions"; 

// ✅ Fetch likes for a post
export const fetchLikes = createAsyncThunk(
  "likes/fetchLikes",
  async (postId: number, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.token;

      if (!token) {
        return thunkAPI.rejectWithValue("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/posts/${postId}/like/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return { postId, likes: response.data };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.detail || "Failed to fetch likes");
    }
  }
);

// ✅ Like or unlike a post
export const toggleLike = createAsyncThunk(
  "likes/toggleLike",
  async (postId: number, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.token;

      if (!token) {
        return thunkAPI.rejectWithValue("No authentication token found");
      }

      const response = await axios.post(`${API_URL}/posts/${postId}/like/`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return { postId, message: response.data.message };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.detail || "Failed to like post");
    }
  }
);

interface LikeState {
  likes: Record<number, any[]>; // Stores likes for each post
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: LikeState = {
  likes: {},
  status: "idle",
  error: null,
};

const likeSlice = createSlice({
  name: "likes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLikes.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchLikes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.likes[action.payload.postId] = action.payload.likes;
      })
      .addCase(fetchLikes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId, message } = action.payload;
        if (message === "Post liked") {
          state.likes[postId] = [...(state.likes[postId] || []), { liked: true }];
        } else {
          state.likes[postId] = state.likes[postId]?.filter((like) => like.liked !== true) || [];
        }
      });
  },
});

export default likeSlice.reducer;
