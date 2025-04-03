// src/redux/selectors.ts
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './store';


export const selectCommentsByPostId = createSelector(
  (state: RootState) => state.comments.commentsByPost,
  (_, postId: number) => postId,
  (commentsByPost, postId) => commentsByPost[postId] || []
);

export const selectLikesByPostId = createSelector(
  (state: RootState) => state.likes.likes,
  (_, postId: number) => postId,
  (likes, postId) => likes[postId] || []
);