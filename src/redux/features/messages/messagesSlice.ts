import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../../api/api"; // ✅ central API instance

// ✅ Type definitions
export interface Participant {
  id: number;
  username: string;
  email: string;
  profile_image: string | null;
}

export interface User {
  id: number;
  username: string;
  email: string;
  profile_picture?: string;
}

export interface Message {
  id: number | string;
  conversation: number;
  sender: number;
  sender_username: string;
  text: string;
  created_at: string;
}

export interface Conversation {
  id: number;
  participants: User[];
  messages: Message[];
  created_at: string;
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
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/messages/conversations/");
      return res.data as Conversation[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to fetch conversations");
    }
  }
);

// ✅ Fetch messages in a conversation
export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async (conversationId: number, { rejectWithValue }) => {
    try {
      const res = await api.get(`/messages/conversations/${conversationId}/messages/`);
      return res.data as Message[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to fetch messages");
    }
  }
);

// ✅ Start new conversation
export const startConversation = createAsyncThunk(
  "messages/startConversation",
  async (userId: number, { rejectWithValue }) => {
    try {
      const res = await api.post(`/messages/start/${userId}/`, {});
      return res.data as Conversation;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to start conversation");
    }
  }
);

// ✅ Fetch conversation with specific user
export const fetchConversationWithUser = createAsyncThunk(
  "messages/fetchConversationWithUser",
  async (userId: number, { rejectWithValue }) => {
    try {
      const res = await api.get(`/messages/conversations/with/${userId}/`);
      return res.data.length > 0 ? (res.data[0] as Conversation) : null;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to fetch conversation");
    }
  }
);

// ✅ Search users
export const searchUsers = createAsyncThunk(
  "messages/searchUsers",
  async (query: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/messages/search/?q=${query}`);
      return res.data.users as User[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Search failed");
    }
  }
);

// ✅ Slice
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
          const exists = state.conversations.find((c) => c.id === action.payload!.id);
          if (!exists) {
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
        const exists = state.conversations.find((c) => c.id === action.payload.id);
        if (!exists) {
          state.conversations.push(action.payload);
        }
        state.activeConversation = action.payload;
        state.loading = false;
      })

      .addCase(searchUsers.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      })

      // Global loading and error handlers
      .addMatcher(
        (action) =>
          action.type.startsWith("messages/") && action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("messages/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
        }
      );
  },
});

export const { setActiveConversation, addMessage } = messagesSlice.actions;
export default messagesSlice.reducer;
