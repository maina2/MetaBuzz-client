import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import postsReducer from "./features/posts/postSlice"; 
import commentsReducer from './features/comments/commentsSlice'
import likesReducer from './features/likes/likesSlice'
import profileReducer from "./features/profile/profileSlice";
import followReducer from "./features/follow/followSlice";
import messagesReducer from "./features/messages/messagesSlice";
import notificationsReducer from "./features/notifications/notificationsSlice"; // Add this



const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    comments: commentsReducer,
    likes:likesReducer,
    profile: profileReducer,
    follow: followReducer,
    messages: messagesReducer,
    notifications: notificationsReducer,

  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
