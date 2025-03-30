import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../../api/api"; 

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
  selectedUser: UserProfile | null;
  userPosts: Post[];
  loading: boolean;
  updating: boolean;
  error: string | null;
  updateSuccess: boolean;
}

// Initial State

const initialState: ProfileState = {
  user: null,
  selectedUser: null,
  userPosts: [],
  loading: false,
  updating: false,
  error: null,
  updateSuccess: false,
};

// Async Thunks
// Get profile of the logged-in user
export const fetchUserProfile = createAsyncThunk<UserProfile, void, { rejectValue: string }>(
  "profile/fetchUserProfile",
  async (_, thunkAPI) => {
    try {
      const response = await api.get("/users/profile/");
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.detail || "Failed to load profile");
    }
  }
);

// Get profile and posts of another user by ID
export const fetchUserProfileAndPosts = createAsyncThunk<
  { user: UserProfile; posts: Post[] },
  number,
  { rejectValue: string }
>(
  "profile/fetchUserProfileAndPosts",
  async (userId, thunkAPI) => {
    try {
      const response = await api.get(`/users/profile/${userId}/`);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.detail || "Failed to fetch user profile and posts");
    }
  }
);

// Update profile of the logged-in user
export const updateUserProfile = createAsyncThunk<UserProfile, Partial<UserProfile>, { rejectValue: string }>(
  "profile/updateUserProfile",
  async (updatedData, thunkAPI) => {
    try {
      const response = await api.put("/users/profile/", updatedData);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.detail || "Failed to update profile");
    }
  }
);

// Slice

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

      .addCase(fetchUserProfileAndPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfileAndPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload.user;
        state.userPosts = action.payload.posts;
      })
      .addCase(fetchUserProfileAndPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Unknown error";
      })

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
      });
  },
});


export const { clearProfileState } = profileSlice.actions;
export default profileSlice.reducer;
