export interface UserType {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  bio: string;
  profile_picture: string;
  phone: string;
  followers_count: number;
  following_count: number;
}

export interface PostType {
  id: number;
  user: UserType;
  content: string;
  image?: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
}

export interface CommentType {
  id: number;
  user?: UserType;
  post: number;
  content: string;
  created_at: string;
}