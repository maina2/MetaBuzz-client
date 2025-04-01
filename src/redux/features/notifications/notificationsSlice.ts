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
export default notificationsSlice.reducer;
