import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// Define user type based on your API response
interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  bio: string | null;
  profile_picture: string | null;
}

interface ProfileState {
  user: UserProfile | null;
  loading: boolean;
  updating: boolean;
  error: string | null;
  updateSuccess: boolean;
}

const initialState: ProfileState = {
  user: null,
  loading: false,
  updating: false,
  error: null,
  updateSuccess: false,
};

const API_URL = 'http://127.0.0.1:8000/users'

// Fetch Profile
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

// Update Profile
export const updateUserProfile = createAsyncThunk<UserProfile, Partial<UserProfile>, { rejectValue: string }>(
  "profile/updateUserProfile",
  async (updatedData, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(`${API_URL}/profile/`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.detail || "Failed to update profile");
    }
  }
);

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
      // Fetch
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

      // Update
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
