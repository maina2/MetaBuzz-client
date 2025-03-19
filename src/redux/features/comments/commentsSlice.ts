import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../../store"; // Import RootState

const API_URL = "http://127.0.0.1:8000/posts";

// Define Comment interface
export interface Comment {
  id: number;
  post: number; // postId
  user: string;
  text: string;
  created_at: string;
}

// Define state structure
interface CommentsState {
  commentsByPost: { [postId: number]: Comment[] }; // Store comments per post
  loading: boolean;
  error: string | null;
}

const initialState: CommentsState = {
  commentsByPost: {}, // Initialize as an empty object
  loading: false,
  error: null,
};

// ✅ Function to get auth token from Redux store
const getAuthHeaders = (state: RootState) => {
  const token = state.auth.token; // Ensure correct token access like in postsSlice
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ✅ Fetch comments for a specific post (Requires authentication)
export const fetchComments = createAsyncThunk(
  "comments/fetchComments",
  async (postId: number, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const headers = getAuthHeaders(state);

      if (!headers.Authorization) {
        return rejectWithValue("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/${postId}/comments/`, { headers });
      return { postId, comments: response.data }; // Return postId to store comments under correct post
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to fetch comments");
    }
  }
);

// ✅ Create a new comment (Requires authentication)
export const createComment = createAsyncThunk(
  "comments/createComment",
  async ({ postId, text }: { postId: number; text: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const headers = getAuthHeaders(state);

      if (!headers.Authorization) {
        return rejectWithValue("No authentication token found");
      }

      const response = await axios.post(
        `${API_URL}/${postId}/comments/create/`,
        { post: postId, text },
        { headers }
      );

      return { postId, comment: response.data }; // Return new comment with postId
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to post comment");
    }
  }
);

// ✅ Comments slice
const commentsSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false;
        state.commentsByPost[action.payload.postId] = action.payload.comments;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        if (!state.commentsByPost[postId]) {
          state.commentsByPost[postId] = [];
        }
        state.commentsByPost[postId].push(comment);
      });
  },
});

export default commentsSlice.reducer;
