// src/api/api.ts
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";

// Update this to your real API base URL
const API_URL = "http://127.0.0.1:8000";

// Public endpoints that do NOT require Authorization
const publicEndpoints = [
  "/users/login/",
  "/users/register/",
  "/users/token/refresh/",
];

// Create an Axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Handle access token refreshing
const refreshToken = async (): Promise<string | null> => {
  try {
    const refresh = localStorage.getItem("refresh");
    if (!refresh) throw new Error("No refresh token found");

    const response = await axios.post(`${API_URL}/users/token/refresh/`, { refresh });

    const newAccessToken = response.data.access;
    localStorage.setItem("access", newAccessToken);
    return newAccessToken;
  } catch (error) {
    console.error("Token refresh failed:", error);
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "/login"; // Redirect to login if refresh fails
    return null;
  }
};

// Request interceptor — attaches token except for public endpoints
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const isPublic = publicEndpoints.some(endpoint => config.url?.includes(endpoint));
    const access = localStorage.getItem("access");

    if (!isPublic && access) {
      config.headers.Authorization = `Bearer ${access}`;
    }

    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — refresh token on 401
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newAccess = await refreshToken();

      if (newAccess) {
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest); // Retry with new token
      }
    }

    return Promise.reject(error);
  }
);

export default api;
