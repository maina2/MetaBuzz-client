// src/features/follow/followSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import api from "../../../api/api"; 

// Async thunk to toggle follow/unfollow
export const toggleFollow = createAsyncThunk<
  { message: string; userId: number; isFollowing: boolean },
  number,
  { state: RootState }
>("follow/toggleFollow", async (userId, { rejectWithValue }) => {
  try {
    const response = await api.post(`/interactions/${userId}/follow/`, {});
    const isFollowing = response.data.message === "User followed";

    return {
      message: response.data.message,
      userId,
      isFollowing,
    };
  } catch (error: any) {
    return rejectWithValue(error.response?.data || "Follow/unfollow failed");
  }
});

// Fetch list of followed users
export const fetchFollowedUsers = createAsyncThunk<
  number[],
  void,
  { state: RootState }
>("follow/fetchFollowedUsers", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get(`/interactions/users/following/`);
    return response.data.map((user: any) => user.id);
  } catch (error: any) {
    return rejectWithValue(error.response?.data || "Failed to fetch followed users");
  }
});

// Define the state type
interface FollowState {
  followedUsers: number[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: FollowState = {
  followedUsers: [],
  loading: false,
  error: null,
};

// Create the slice
const followSlice = createSlice({
  name: "follow",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Toggle Follow
      .addCase(toggleFollow.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleFollow.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload.isFollowing) {
          if (!state.followedUsers.includes(action.payload.userId)) {
            state.followedUsers.push(action.payload.userId);
          }
        } else {
          state.followedUsers = state.followedUsers.filter(
            (id) => id !== action.payload.userId
          );
        }
      })
      .addCase(toggleFollow.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Followed Users
      .addCase(fetchFollowedUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFollowedUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.followedUsers = action.payload;
      })
      .addCase(fetchFollowedUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default followSlice.reducer;
