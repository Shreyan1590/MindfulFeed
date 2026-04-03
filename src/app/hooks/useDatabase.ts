/**
 * Custom hooks for database interactions
 * All database operations go through the server
 */

import { useState, useEffect, useCallback } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-36d0365b`;

// ======================
// User Hooks
// ======================

export function useCreateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUser = useCallback(async (userId: string, email: string, fullName: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${SERVER_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ userId, email, fullName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      console.log('✅ User created successfully:', data.user);
      return data.user;
    } catch (err: any) {
      console.error('❌ Error creating user:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createUser, loading, error };
}

export function useUser(userId: string | null) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${SERVER_URL}/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch user');
        }

        setUser(data.user);
      } catch (err: any) {
        console.error('❌ Error fetching user:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return { user, loading, error };
}

// ======================
// Content Moderation Hooks
// ======================

export function useContentModeration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const moderateContent = useCallback(async (
    content: string,
    title?: string,
    imageUrl?: string,
    userId?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🛡️ Sending content for moderation...');
      
      const response = await fetch(`${SERVER_URL}/moderate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ content, title, imageUrl, userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to moderate content');
      }

      const result = data.moderation;
      
      if (result.approved) {
        console.log('✅ Content APPROVED - Score:', result.score);
      } else {
        console.log('❌ Content REJECTED - Reason:', result.reason);
      }

      return result;
    } catch (err: any) {
      console.error('❌ Error moderating content:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { moderateContent, loading, error };
}

// ======================
// Post Hooks
// ======================

export function useCreatePost() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPost = useCallback(async (
    userId: string,
    content: string,
    title?: string,
    imageUrl?: string,
    moderationResult?: any
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${SERVER_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ userId, content, title, imageUrl, moderationResult }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create post');
      }

      console.log('✅ Post created successfully:', data.post.postId);
      return data.post;
    } catch (err: any) {
      console.error('❌ Error creating post:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createPost, loading, error };
}

export function usePosts() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${SERVER_URL}/posts`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch posts');
      }

      setPosts(data.posts || []);
    } catch (err: any) {
      console.error('❌ Error fetching posts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, error, refetch: fetchPosts };
}

export function usePost(postId: string | null) {
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) return;

    const fetchPost = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${SERVER_URL}/posts/${postId}`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch post');
        }

        setPost(data.post);
      } catch (err: any) {
        console.error('❌ Error fetching post:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  return { post, loading, error };
}

export function useUserPosts(userId: string | null) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchUserPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${SERVER_URL}/users/${userId}/posts`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch user posts');
        }

        setPosts(data.posts || []);
      } catch (err: any) {
        console.error('❌ Error fetching user posts:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [userId]);

  return { posts, loading, error };
}

export function useLikePost() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const likePost = useCallback(async (postId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${SERVER_URL}/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to like post');
      }

      return data.likes;
    } catch (err: any) {
      console.error('❌ Error liking post:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { likePost, loading, error };
}

export function useDeletePost() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deletePost = useCallback(async (postId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${SERVER_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete post');
      }

      console.log('✅ Post deleted successfully');
      return true;
    } catch (err: any) {
      console.error('❌ Error deleting post:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deletePost, loading, error };
}

// ======================
// Combined Hook for Upload Flow
// ======================

export function useUploadWithModeration() {
  const { moderateContent, loading: moderating } = useContentModeration();
  const { createPost, loading: posting } = useCreatePost();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [moderationResult, setModerationResult] = useState<any>(null);

  const uploadPost = useCallback(async (
    userId: string,
    content: string,
    title?: string,
    imageUrl?: string
  ) => {
    setLoading(true);
    setError(null);
    setModerationResult(null);

    try {
      // Step 1: Moderate content
      console.log('🛡️ Step 1: Moderating content...');
      const modResult = await moderateContent(content, title, imageUrl, userId);
      setModerationResult(modResult);

      if (!modResult.approved) {
        throw new Error(modResult.reason || 'Content did not pass moderation');
      }

      // Step 2: Create post
      console.log('📝 Step 2: Creating post...');
      const post = await createPost(userId, content, title, imageUrl, modResult);

      console.log('✅ Upload complete!');
      return { post, moderation: modResult };
    } catch (err: any) {
      console.error('❌ Upload failed:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [moderateContent, createPost]);

  return {
    uploadPost,
    loading: loading || moderating || posting,
    error,
    moderationResult,
  };
}
