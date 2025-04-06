import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api"; 

const API_URL = "/interactions";

// Fetch likes for a post
export const fetchLikes = createAsyncThunk(
  "likes/fetchLikes",
  async (postId: number, thunkAPI) => {
    try {
      const response = await api.get(`${API_URL}/posts/${postId}/like/`);
      return { postId, likes: response.data };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.detail || "Failed to fetch likes"
      );
    }
  }
);

// Like or unlike a post
export const toggleLike = createAsyncThunk(
  "likes/toggleLike",
  async (postId: number, thunkAPI) => {
    try {
      const response = await api.post(`${API_URL}/posts/${postId}/like/`, null);
      return { postId, message: response.data.message };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.detail || "Failed to like post"
      );
    }
  }
);

// Define like state
interface LikeState {
  likes: Record<number, any[]>; // likes[postId] = [{ liked: true }]
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// Initial state
const initialState: LikeState = {
  likes: {},
  status: "idle",
  error: null,
};

// Slice
const likeSlice = createSlice({
  name: "likes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLikes.pending, (state) => {
        state.status = "loading";
        state.error = null;
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
          state.likes[postId] = [
            ...(state.likes[postId] || []),
            { liked: true },
          ];
        } else {
          state.likes[postId] =
            state.likes[postId]?.filter((like) => like.liked !== true) || [];
        }
      });
  },
});

export default likeSlice.reducer;
