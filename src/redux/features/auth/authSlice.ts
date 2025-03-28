import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Define the backend URL
const API_URL = "http://127.0.0.1:8000/users"; // Adjust this based on your Django backend

// Load user from localStorage (if available)
const user = localStorage.getItem("user")
  ? JSON.parse(localStorage.getItem("user")!)
  : null;

// Initial state
const initialState = {
  user: user,
  token: localStorage.getItem("token") || null,
  isAuthenticated: user ? true : false,
  loading: false,
  error: null as string | null,
};

// Async thunk for login
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: { username:string, email: string; password: string }, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/login/`, credentials);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("token", response.data.access);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.detail);
    }
  }
);

// Async thunk for signup
export const signupUser = createAsyncThunk(
  "auth/signup",
  async (userData: { username: string; email: string; password: string }, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/register/`, userData);
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (_, thunkAPI) => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
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
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export default authSlice.reducer;
