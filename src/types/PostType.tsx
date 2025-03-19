export interface PostType {
    id: number;
    user: string; 
    content: string;
    image?: string; 
    created_at: string;
    likes_count: number;
    comments_count: number;
  }
  