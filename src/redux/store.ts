import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import postsReducer from "./features/posts/postSlice"; 
import commentsReducer from './features/comments/commentsSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    comments: commentsReducer,

  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
