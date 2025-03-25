import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// -----------------------------
// Define Types
// -----------------------------

interface Post {
  id: number;
  content: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  author: {
    username: string;
    profile_picture: string | null;
  };
  // Add other fields as needed
}

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  bio: string | null;
  profile_picture: string | null;
  followers_count: number;
  following_count: number;
}

interface ProfileState {
  user: UserProfile | null;
  selectedUser: UserProfile | null;         // 👈 For viewing other users' profiles
  userPosts: Post[];                        // 👈 Posts made by the selected user
  loading: boolean;
  updating: boolean;
  error: string | null;
  updateSuccess: boolean;
}

// -----------------------------
// Initial State
// -----------------------------

const initialState: ProfileState = {
  user: null,
  selectedUser: null,
  userPosts: [],
  loading: false,
  updating: false,
  error: null,
  updateSuccess: false,
};

const API_URL = 'http://127.0.0.1:8000/users';

// -----------------------------
// Thunks
// -----------------------------

// Fetch logged-in user's profile
export const fetchUserProfile = createAsyncThunk<UserProfile, void, { rejectValue: string }>(
  "profile/fetchUserProfile",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/profile/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.detail || "Failed to load profile");
    }
  }
);

// Fetch other user's profile and posts
export const fetchUserProfileAndPosts = createAsyncThunk<
  { user: UserProfile; posts: Post[] }, 
  number,  // Changed from string to number
  { rejectValue: string }
>(
  'profile/fetchUserProfileAndPosts',
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/profile/${userId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      

      
      return res.data; // should return { user, posts }
    } catch (err: any) {
      console.error('Fetch error:', err.response?.data);
      return rejectWithValue(err.response?.data?.detail || "Failed to fetch user profile and posts");
    }
  }
);
// Update logged-in user's profile
export const updateUserProfile = createAsyncThunk<UserProfile, Partial<UserProfile>, { rejectValue: string }>(
  "profile/updateUserProfile",
  async (updatedData, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(`${API_URL}/profile/`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.detail || "Failed to update profile");
    }
  }
);

// -----------------------------
// Slice
// -----------------------------

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfileState: (state) => {
      state.error = null;
      state.updateSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch current user's profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Unknown error";
      })

      // Update current user's profile
      .addCase(updateUserProfile.pending, (state) => {
        state.updating = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateUserProfile.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.updating = false;
        state.user = action.payload;
        state.updateSuccess = true;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload ?? "Unknown error";
      })

      // Fetch other user's profile + posts
      .addCase(fetchUserProfileAndPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfileAndPosts.fulfilled, (state, action) => {
        state.selectedUser = action.payload.user;
        state.userPosts = action.payload.posts;
        state.loading = false;
      })
      .addCase(fetchUserProfileAndPosts.rejected, (state, action) => {
        state.error = action.payload ?? "Unknown error";
        state.loading = false;
      });
  },
});

export const { clearProfileState } = profileSlice.actions;
export default profileSlice.reducer;
