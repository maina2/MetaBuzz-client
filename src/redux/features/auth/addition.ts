// src/features/comments/commentsSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api"; 
// import { RootState } from "../../store";

// Define Comment interface
export interface Comment {
  id: number;
  post: number;
  user: string;
  text: string;
  created_at: string;
}

// Define state structure
interface CommentsState {
  commentsByPost: { [postId: number]: Comment[] };
  loading: boolean;
  error: string | null;
}

const initialState: CommentsState = {
  commentsByPost: {},
  loading: false,
  error: null,
};

//    Fetch comments for a specific post
export const fetchComments = createAsyncThunk(
  "comments/fetchComments",
  async (postId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/posts/${postId}/comments/`);
      return { postId, comments: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to fetch comments");
    }
  }
);

//  Create a new comment
export const createComment = createAsyncThunk(
  "comments/createComment",
  async (
    { postId, text }: { postId: number; text: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(`/posts/${postId}/comments/create/`, {
        post: postId,
        text,
      });
      return { postId, comment: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to post comment");
    }
  }
);

// Comments slice
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
// src/redux/features/notifications/notificationsSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api";

// Async thunk to fetch notifications from the backend
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (_, thunkAPI) => {
    try {
      const response = await api.get("/notifications/");
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data || "Failed to fetch notifications");
    }
  }
);

interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationState {
  notifications: Notification[];
}

const initialState: NotificationState = {
  notifications: [],
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
    },
    markAsRead: (state, action) => {
      state.notifications = state.notifications.map((notification) =>
        notification.id === action.payload ? { ...notification, is_read: true } : notification
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
      });
  },
});

export const { addNotification, markAsRead } = notificationsSlice.actions;
