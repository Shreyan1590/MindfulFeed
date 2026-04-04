/**
 * Mobile RAG Service (Retrieval-Augmented Generation)
 * 
 * Proxies the full article content and user query securely to the 
 * Cloudflare Native AI backend for chunking, embedding generation, 
 * similarity search, and bounded QA LLM synthesis.
 */

const API_BASE_URL = 'https://mindfulfeed.info-skillxpress.workers.dev';

export interface RAGResponse {
  answer: string;
  confidence: number;
  chunksUsed: number;
}

class RAGService {
  /**
   * Queries the AI regarding the current article.
   * Throws strictly constrained errors if unable to reach RAG endpoint.
   */
  async askQuestion(articleText: string, question: string): Promise<RAGResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rag/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleText,
          question
        })
      });

      if (!response.ok) {
        throw new Error('Failed to query MindfulFeed RAG Engine');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('RAG Service Error:', error);
      throw error;
    }
  }
}

export const ragService = new RAGService();
