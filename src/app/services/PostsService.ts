/**
 * Posts Service — Fetches posts from the Cloudflare Worker API
 */

import { apiUrl } from './api';

export interface PostFeed {
  id: string;
  title: string;
  caption: string;
  category: string;
  image_url: string;
  xp: number;
  attention_score: number;
  content_quality: string;
  read_time: string;
  views: number;
  comments: number;
  author_name: string;
  author_avatar: string;
  author_level: number;
  tags: string[];
  created_at: string;
}

export interface PostDetail extends PostFeed {
  content: string;
}

class PostsService {
  async fetchPosts(): Promise<PostFeed[]> {
    try {
      console.log('[PostsService] Fetching posts from API...');
      const response = await fetch(apiUrl('/api/posts'));
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status}`);
      }
      const data = await response.json();
      console.log(`[PostsService] Received ${data.posts?.length || 0} posts`);
      return data.posts || [];
    } catch (error) {
      console.error('[PostsService] Error fetching posts:', error);
      return [];
    }
  }

  async fetchPost(postId: string): Promise<PostDetail | null> {
    try {
      console.log(`[PostsService] Fetching post ${postId}...`);
      const response = await fetch(apiUrl(`/api/posts/${postId}`));
      if (!response.ok) {
        throw new Error(`Failed to fetch post: ${response.status}`);
      }
      const data = await response.json();
      return data.post || null;
    } catch (error) {
      console.error('[PostsService] Error fetching post:', error);
      return null;
    }
  }
}

export const postsService = new PostsService();
