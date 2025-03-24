import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../../store";

// Base API URL
const API_URL = "http://127.0.0.1:8000/users";

// Get token from auth state
const getToken = (getState: () => RootState) => {
  const token = getState().auth.token;
  return token ? `Bearer ${token}` : "";
};

// Async thunk to toggle follow/unfollow
export const toggleFollow = createAsyncThunk<
  { message: string; userId: number },
  number,
  { state: RootState }
>(
  "follow/toggleFollow",
  async (userId, { getState, rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/${userId}/follow/`,
        {},
        {
          headers: {
            Authorization: getToken(getState),
          },
        }
      );

      return { message: response.data.message, userId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Follow/unfollow failed");
    }
  }
);

// Async thunk to fetch followers of a user
export const fetchFollowers = createAsyncThunk<
  any[],
  number,
  { state: RootState }
>(
  "follow/fetchFollowers",
  async (userId, { getState, rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${userId}/follow/`, {
        headers: {
          Authorization: getToken(getState),
        },
      });

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Fetching followers failed");
    }
  }
);

// Async thunk to fetch who you're following
export const fetchFollowing = createAsyncThunk<
  any[],
  void,
  { state: RootState }
>(
  "follow/fetchFollowing",
  async (_, { getState, rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/following/`, {
        headers: {
          Authorization: getToken(getState),
        },
      });

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Fetching following failed");
    }
  }
);

interface FollowState {
  loading: boolean;
  error: string | null;
  followers: any[];
  following: any[];
  followedUsers: number[];
}

const initialState: FollowState = {
  loading: false,
  error: null,
  followers: [],
  following: [],
  followedUsers: [],
};

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
        const { message, userId } = action.payload;

        if (message === "User followed") {
          state.followedUsers.push(userId);
        } else if (message === "Unfollowed user") {
          state.followedUsers = state.followedUsers.filter((id) => id !== userId);
        }
      })
      .addCase(toggleFollow.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Followers
      .addCase(fetchFollowers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFollowers.fulfilled, (state, action) => {
        state.loading = false;
        state.followers = action.payload;
      })
      .addCase(fetchFollowers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ✅ Fetch Following
      .addCase(fetchFollowing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFollowing.fulfilled, (state, action) => {
        state.loading = false;
        state.following = action.payload;
        state.followedUsers = action.payload.map((item: any) => item.following?.id);
      })
      .addCase(fetchFollowing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default followSlice.reducer;
