import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../../store";

const API_BASE = "http://127.0.0.1:8000";

export interface Message {
  id: number;
  sender: number;
  sender_username: string;
  conversation: number;
  text: string;
  created_at: string;
}

export interface Conversation {
  id: number;
  participants: number[];
  messages: Message[];
  created_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
}

interface MessagesState {
  conversations: Conversation[];
  messages: Message[];
  activeConversation: Conversation | null;
  searchResults: User[];
  loading: boolean;
  error: string | null;
}

const initialState: MessagesState = {
  conversations: [],
  messages: [],
  activeConversation: null,
  searchResults: [],
  loading: false,
  error: null,
};

// ✅ Fetch conversations
export const fetchConversations = createAsyncThunk(
  "messages/fetchConversations",
  async (_, { rejectWithValue, getState }) => {
    const token = (getState() as RootState).auth.token;
    try {
      const res = await axios.get(`${API_BASE}/messages/conversations/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response.data);
    }
  }
);

// ✅ Fetch messages in a conversation
export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async (conversationId: number, { rejectWithValue, getState }) => {
    const token = (getState() as RootState).auth.token;
    try {
      const res = await axios.get(
        `${API_BASE}/messages/conversations/${conversationId}/messages/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response.data);
    }
  }
);

// ✅ Start new conversation with user
export const startConversation = createAsyncThunk(
  "messages/startConversation",
  async (userId: number, { rejectWithValue, getState }) => {
    const token = (getState() as RootState).auth.token;
    try {
      const res = await axios.post(
        `${API_BASE}/messages/start/${userId}/`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response.data);
    }
  }
);

// ✅ Fetch conversation with a specific user (by user ID)
export const fetchConversationWithUser = createAsyncThunk(
  "messages/fetchConversationWithUser",
  async (userId: number, { rejectWithValue, getState }) => {
    const token = (getState() as RootState).auth.token;
    try {
      const res = await axios.get(
        `${API_BASE}/messages/conversations/with/${userId}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return res.data.length > 0 ? res.data[0] : null; // API returns a list, we expect one match
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data || "Failed to fetch conversation"
      );
    }
  }
);

// ✅ Search users to start a conversation
export const searchUsers = createAsyncThunk(
  "messages/searchUsers",
  async (query: string, { rejectWithValue, getState }) => {
    const token = (getState() as RootState).auth.token;
    try {
      const res = await axios.get(`${API_BASE}/messages/search/?q=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.users;
    } catch (err: any) {
      return rejectWithValue(err.response.data);
    }
  }
);

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setActiveConversation: (state, action: PayloadAction<Conversation>) => {
      state.activeConversation = action.payload;
      state.messages = action.payload.messages;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversationWithUser.fulfilled, (state, action) => {
        if (action.payload) {
          const existing = state.conversations.find(
            (c) => c.id === action.payload.id
          );
          if (!existing) {
            state.conversations.push(action.payload);
          }
          state.activeConversation = action.payload;
          state.messages = action.payload.messages;
        } else {
          state.activeConversation = null;
          state.messages = [];
        }
        state.loading = false;
      })

      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations = action.payload;
        state.loading = false;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages = action.payload;
        state.loading = false;
      })
      .addCase(startConversation.fulfilled, (state, action) => {
        const exists = state.conversations.find(
          (c) => c.id === action.payload.id
        );
        if (!exists) {
          state.conversations.push(action.payload);
        }
        state.activeConversation = action.payload;
        state.loading = false;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      })

      .addMatcher(
        (action) =>
          action.type.startsWith("messages/") &&
          action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("messages/") &&
          action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
        }
      );
  },
});

export const { setActiveConversation, addMessage } = messagesSlice.actions;
export default messagesSlice.reducer;
