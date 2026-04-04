/**
 * Cloudflare Worker for MindfulFeed
 * 
 * Handles:
 * - R2 Object Storage uploads/downloads
 * - D1 Database proxy
 * - CORS handling
 * 
 * Deploy this to Cloudflare Workers
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // R2 Upload endpoint
      if (path.startsWith('/r2/') && request.method === 'PUT') {
        return await handleR2Upload(request, env, corsHeaders);
      }

      // R2 Download endpoint
      if (path.startsWith('/r2/') && request.method === 'GET') {
        return await handleR2Download(request, env, corsHeaders);
      }

      // R2 Delete endpoint
      if (path.startsWith('/r2/') && request.method === 'DELETE') {
        return await handleR2Delete(request, env, corsHeaders);
      }

      // D1 Query endpoint
      if (path === '/d1/query' && request.method === 'POST') {
        return await handleD1Query(request, env, corsHeaders);
      }

      // Health check
      if (path === '/health') {
        return new Response(JSON.stringify({ status: 'ok', timestamp: Date.now() }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // RAG Chat Endpoint using Cloudflare Workers AI
      if (path === '/api/rag/chat' && request.method === 'POST') {
        return await handleRAGChat(request, env, corsHeaders);
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });
    } catch (error) {
      console.error('Worker Error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};

/**
 * Handle R2 file upload
 */
async function handleR2Upload(request, env, corsHeaders) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  // Path format: /r2/{bucket}/{key}
  const bucket = pathParts[1];
  const key = pathParts.slice(2).join('/');

  if (!bucket || !key) {
    return new Response('Invalid path', { status: 400, headers: corsHeaders });
  }

  try {
    // Get R2 bucket (env.R2_BUCKET should be bound in wrangler.toml)
    const r2Bucket = env.MINDFULFEED_ASSETS;

    // Upload file to R2
    const file = await request.arrayBuffer();
    await r2Bucket.put(key, file, {
      httpMetadata: {
        contentType: request.headers.get('Content-Type') || 'application/octet-stream',
      },
    });

    const publicUrl = `https://assets.mindfulfeed.app/${key}`;

    return new Response(
      JSON.stringify({
        success: true,
        url: publicUrl,
        key: key,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Handle R2 file download
 */
async function handleR2Download(request, env, corsHeaders) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const bucket = pathParts[1];
  const key = pathParts.slice(2).join('/');

  if (!bucket || !key) {
    return new Response('Invalid path', { status: 400, headers: corsHeaders });
  }

  try {
    const r2Bucket = env.MINDFULFEED_ASSETS;
    const object = await r2Bucket.get(key);

    if (!object) {
      return new Response('Not Found', { status: 404, headers: corsHeaders });
    }

    const headers = {
      ...corsHeaders,
      'Content-Type': object.httpMetadata.contentType || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000',
    };

    return new Response(object.body, { headers });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Handle R2 file delete
 */
async function handleR2Delete(request, env, corsHeaders) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const bucket = pathParts[1];
  const key = pathParts.slice(2).join('/');

  if (!bucket || !key) {
    return new Response('Invalid path', { status: 400, headers: corsHeaders });
  }

  try {
    const r2Bucket = env.MINDFULFEED_ASSETS;
    await r2Bucket.delete(key);

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Handle D1 database query
 */
async function handleD1Query(request, env, corsHeaders) {
  try {
    const { sql, params } = await request.json();

    if (!sql) {
      return new Response('Missing SQL query', { status: 400, headers: corsHeaders });
    }

    // Execute query on D1 (env.DB should be bound in wrangler.toml)
    const db = env.MINDFULFEED_DB;
    const result = params 
      ? await db.prepare(sql).bind(...params).all()
      : await db.prepare(sql).all();

    return new Response(
      JSON.stringify({
        success: true,
        result: result.results,
        meta: result.meta,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Handle RAG Chat Question
 */
async function handleRAGChat(request, env, corsHeaders) {
  try {
    const { articleText, question } = await request.json();

    if (!articleText || !question) {
      return new Response('Missing articleText or question', { status: 400, headers: corsHeaders });
    }

    // 1. Chunk the article
    const chunks = chunkText(articleText, 300, 50);

    // 2. Generate embeddings for chunks
    // Uses Cloudflare native embedding model
    const chunkEmbeddingsRes = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: chunks });
    const chunkEmbeddings = chunkEmbeddingsRes.data;

    // 3. Generate embedding for query
    const queryEmbeddingRes = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: [question] });
    const queryEmbedding = queryEmbeddingRes.data[0];

    // 4. Similarity Search (Cosine)
    const scoredChunks = chunks.map((chunk, index) => {
      return {
        chunk,
        score: cosineSimilarity(queryEmbedding, chunkEmbeddings[index])
      };
    });

    // Sort by relevance (highest score first)
    scoredChunks.sort((a, b) => b.score - a.score);
    
    // 5. Select top 3 chunks
    const topChunks = scoredChunks.slice(0, 3);
    const highestScore = topChunks[0]?.score || 0;

    // Apply strict threshold to prevent hallucination
    if (highestScore < 0.5) {
      return new Response(JSON.stringify({ 
        answer: "This information is not available in the article.",
        confidence: highestScore,
        chunksUsed: 0
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const contextHTML = topChunks.map(c => c.chunk).join('\n...\n');

    // 6. Strict RAG LLM Prompt
    const promptParams = {
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant that ONLY answers based on the provided article context.

STRICT RULES:
* Answer ONLY using the given context
* DO NOT use external knowledge
* DO NOT guess or hallucinate
* If answer is not found in context, say EXACTLY: "This information is not available in the article."
* Be clear and concise
* Use simple language

CONTEXT:
${contextHTML}`
        },
        {
          role: 'user',
          content: question
        }
      ]
    };

    // 7. Generate Response using standard Llama 3
    const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', promptParams);

    return new Response(
      JSON.stringify({
        answer: response.response,
        confidence: highestScore,
        chunksUsed: topChunks.length
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('RAG Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Split text into overlapping semantic chunks
 */
function chunkText(text, maxWords = 300, overlap = 50) {
  // Simple word-based chunker
  const words = text.split(/\s+/);
  const chunks = [];
  let i = 0;
  
  if (words.length === 0) return [""];
  
  while (i < words.length) {
    const chunkWords = words.slice(i, i + maxWords);
    chunks.push(chunkWords.join(' '));
    i += (maxWords - overlap);
    if (i <= 0) break; // Infinite loop prevention on bad input
  }
  return chunks;
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
