import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../../store";

const API_BASE = "http://127.0.0.1:8000";

export interface Participant {
  id: number;
  username: string;
}

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
  participants: Participant[];
  messages: Message[];
  created_at: string;
}

interface MessagesState {
  conversations: Conversation[];
  messages: Message[];
  activeConversation: Conversation | null;
  loading: boolean;
  error: string | null;
  searchResults: User[];
  searchLoading: boolean;
  searchError: string | null;
}
interface User {
  id: number;
  username: string;
  email: string;
}

const initialState: MessagesState = {
  conversations: [],
  messages: [],
  activeConversation: null,
  loading: false,
  error: null,
  searchResults: [],
  searchLoading: false,
  searchError: null,
};

// ✅ Fetch conversations
export const fetchConversations = createAsyncThunk(
  "messages/fetchConversations",
  async (_, { rejectWithValue, getState }) => {
    const token = (getState() as RootState).auth.token;
    try {
      const res = await axios.get(`${API_BASE}/messages/conversations/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response.data);
    }
  }
);

// ✅ Fetch messages by conversation ID
export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async (conversationId: number, { rejectWithValue, getState }) => {
    const token = (getState() as RootState).auth.token;
    try {
      const res = await axios.get(
        `${API_BASE}/messages/conversations/${conversationId}/messages/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response.data);
    }
  }
);
// In messagesSlice.ts or a new file like usersSlice.ts
export const searchUsers = createAsyncThunk(
  "users/search",
  async (query: string, { rejectWithValue, getState }) => {
    const token = (getState() as RootState).auth.token;
    try {
      const res = await axios.get(`${API_BASE}/messages/search/?q=${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data.users; // Only return users from the response
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
      .addCase(searchUsers.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
        state.searchResults = [];
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.payload as string;
      })

      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setActiveConversation, addMessage } = messagesSlice.actions;
export default messagesSlice.reducer;
