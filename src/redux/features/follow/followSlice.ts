  import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
  import axios from "axios";
  import { RootState } from "../../store";

  // Base API URL
  const API_URL = "http://127.0.0.1:8000/interactions";

  // Get token from auth state
  const getToken = (getState: () => RootState) => {
    const token = getState().auth.token;
    return token ? `Bearer ${token}` : "";
  };

  // Async thunk to toggle follow/unfollow
  export const toggleFollow = createAsyncThunk<
    { message: string; userId: number; isFollowing: boolean },
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

        // Determine if the user is now following or unfollowing
        const isFollowing = response.data.message === "User followed";

        return { 
          message: response.data.message, 
          userId,
          isFollowing
        };
      } catch (error: any) {
        return rejectWithValue(error.response?.data || "Follow/unfollow failed");
      }
    }
  );

  // Fetch list of followed users
  export const fetchFollowedUsers = createAsyncThunk<
    number[], // Return type is an array of user IDs
    void,
    { state: RootState }
  >(
    "follow/fetchFollowedUsers",
    async (_, { getState, rejectWithValue }) => {
      try {
        const response = await axios.get(`${API_URL}/users/following/`, {
          headers: {
            Authorization: getToken(getState),
          },
        });

        // Assuming the response contains an array of user IDs
        return response.data.map((user: any) => user.id);
      } catch (error: any) {
        return rejectWithValue(error.response?.data || "Failed to fetch followed users");
      }
    }
  );

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
            // Add user to followed users if not already present
            if (!state.followedUsers.includes(action.payload.userId)) {
              state.followedUsers.push(action.payload.userId);
            }
          } else {
            // Remove user from followed users
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