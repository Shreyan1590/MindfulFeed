/**
 * React Hook for Cloudflare Integration
 * 
 * Provides easy access to Cloudflare D1 and R2 services
 */

import { useState, useEffect, useCallback } from 'react';
import { cloudflareService } from '../services/CloudflareService';

interface UserProgress {
  userId: string;
  totalPoints: number;
  badges: string[];
  quizProgress: Record<string, number>;
  lastActive: string;
  createdAt: string;
}

export function useCloudflare() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Test connection on mount
  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      const connected = await cloudflareService.testDatabaseConnection();
      setIsConnected(connected);
      if (connected) {
        console.log('✅ Connected to Cloudflare D1');
      }
    } catch (err) {
      console.error('Failed to connect to Cloudflare:', err);
      setIsConnected(false);
    }
  };

  // Save user progress
  const saveProgress = useCallback(async (userId: string, progress: Partial<UserProgress>) => {
    setIsLoading(true);
    setError(null);

    try {
      await cloudflareService.saveUserProgress(userId, progress);
      return true;
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to save progress:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load user progress
  const loadProgress = useCallback(async (userId: string): Promise<UserProgress | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const progress = await cloudflareService.getUserProgress(userId);
      return progress;
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to load progress:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Upload image to R2
  const uploadImage = useCallback(async (file: File, folder: string = 'images'): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const url = await cloudflareService.uploadImage(file, folder);
      return url;
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to upload image:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Upload avatar
  const uploadAvatar = useCallback(async (userId: string, file: File): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const url = await cloudflareService.uploadAvatar(userId, file);
      return url;
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to upload avatar:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Log activity
  const logActivity = useCallback(async (userId: string, activityType: string, activityData: any) => {
    try {
      await cloudflareService.logActivity(userId, activityType, activityData);
    } catch (err) {
      console.error('Failed to log activity:', err);
    }
  }, []);

  // Save chat message
  const saveChatMessage = useCallback(async (
    userId: string,
    articleId: string,
    message: string,
    role: 'user' | 'bot'
  ) => {
    try {
      await cloudflareService.saveChatMessage(userId, articleId, message, role);
    } catch (err) {
      console.error('Failed to save chat message:', err);
    }
  }, []);

  // Get chat history
  const getChatHistory = useCallback(async (userId: string, articleId: string) => {
    try {
      return await cloudflareService.getChatHistory(userId, articleId);
    } catch (err) {
      console.error('Failed to get chat history:', err);
      return [];
    }
  }, []);

  return {
    // Connection status
    isConnected,
    isLoading,
    error,
    testConnection,

    // User progress
    saveProgress,
    loadProgress,

    // File uploads
    uploadImage,
    uploadAvatar,

    // Activity tracking
    logActivity,

    // Chat
    saveChatMessage,
    getChatHistory,

    // Direct service access
    service: cloudflareService,
  };
}
