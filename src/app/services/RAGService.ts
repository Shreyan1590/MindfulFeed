/**
 * Mobile RAG Service (Retrieval-Augmented Generation)
 * 
 * Sends postId and user query to the Cloudflare Worker API.
 * The worker fetches article content from D1 and runs the RAG pipeline.
 */

import { apiUrl } from './api';

export interface RAGResponse {
  answer: string;
}

class RAGService {
  /**
   * Queries the AI regarding the current article.
   * The worker fetches the article content from D1 using postId.
   */
  async askQuestion(postId: string, question: string, history: Array<{role: 'user' | 'assistant', content: string}> = []): Promise<RAGResponse> {
    console.log('[RAGService] Sending request:', { postId, question, historyLength: history.length });

    try {
      const response = await fetch(apiUrl('/api/rag/chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          question,
          history
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[RAGService] Server error:', response.status, errorData);
        throw new Error(errorData.error || `Server returned ${response.status}`);
      }

      const data = await response.json();
      console.log('[RAGService] Response received:', { answer: data.answer?.substring(0, 50) });
      return data;
    } catch (error) {
      console.error('[RAGService] Error:', error);
      throw error;
    }
  }
}

export const ragService = new RAGService();
