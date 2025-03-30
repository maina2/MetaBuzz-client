// src/features/auth/authSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api"; 

// Load user from localStorage
const user = localStorage.getItem("user")
  ? JSON.parse(localStorage.getItem("user")!)
  : null;

// Initial state
const initialState = {
  user: user,
  token: localStorage.getItem("access") || null,
  isAuthenticated: !!user,
  loading: false,
  error: null as string | null,
};

// Async thunk for login
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: { username: string; email: string; password: string }, thunkAPI) => {
    try {
      const response = await api.post("/users/login/", credentials);

      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh); 

      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.detail || "Login failed");
    }
  }
);

// Async thunk for signup
export const signupUser = createAsyncThunk(
  "auth/signup",
  async (userData: { username: string; email: string; password: string }, thunkAPI) => {
    try {
      const response = await api.post("/users/register/", userData);
      return response.data;
    } catch (error: any) {
      console.error("Signup Error:", error.response?.data);
      return thunkAPI.rejectWithValue(error.response?.data || "Signup failed");
    }
  }
);

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, thunkAPI) => {
    localStorage.removeItem("user");
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    return null;
  }
);

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.access;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Signup
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(signupUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export default authSlice.reducer;
