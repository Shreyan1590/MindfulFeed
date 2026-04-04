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
  const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };
  try {
    console.log('--- [RAG Chat] Incoming Request ---');
    
    // 1. SAFE JSON PARSING
    let payload;
    try {
      payload = await request.json();
    } catch (e) {
      console.error('[RAG Chat] Invalid JSON body', e);
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: jsonHeaders });
    }

    const { articleId, question } = payload;
    console.log(`[RAG Chat] Request Body - Article ID: ${articleId}, Question: ${question}`);

    // 2. VALIDATE REQUEST BODY
    if (!articleId || !question) {
      console.error('[RAG Chat] Missing articleId or question');
      return new Response(JSON.stringify({ error: "Missing articleId or question" }), { status: 400, headers: jsonHeaders });
    }

    // 3. FETCH ARTICLE FROM D1
    const db = env.MINDFULFEED_DB;
    console.log(`[RAG Chat] Fetching article ${articleId} from database`);
    
    let articleRow;
    try {
      articleRow = await db.prepare('SELECT content FROM articles WHERE id = ?').bind(articleId).first();
    } catch (dbError) {
      console.error('[RAG Chat] Database Error:', dbError.message, dbError.stack);
      return new Response(JSON.stringify({ error: "Article not found or empty", details: dbError.message }), { status: 400, headers: jsonHeaders });
    }

    if (!articleRow || !articleRow.content || articleRow.content.trim() === '') {
      console.error(`[RAG Chat] Article ${articleId} not found or empty`);
      return new Response(JSON.stringify({ error: "Article not found or empty" }), { status: 400, headers: jsonHeaders });
    }

    const articleText = articleRow.content;
    console.log(`[RAG Chat] Article fetched successfully, Content Length: ${articleText.length}`);

    // 4. CHUNK ARTICLE
    const chunks = chunkText(articleText, 300, 50);
    console.log(`[RAG Chat] Article chunked into ${chunks.length} pieces`);

    // 5. GET EMBEDDINGS (Wrapped safely)
    let chunkEmbeddings;
    let queryEmbedding;
    
    try {
      if (!env.AI) {
        throw new Error("env.AI binding missing from worker");
      }
      
      const chunkEmbeddingsRes = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: chunks });
      chunkEmbeddings = chunkEmbeddingsRes.data;

      const queryEmbeddingRes = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: [question] });
      queryEmbedding = queryEmbeddingRes.data[0];
    } catch (aiError) {
      console.error('[RAG Chat] AI Embedding Error:', aiError.message, aiError.stack);
      return new Response(JSON.stringify({ answer: "This information is not available in the article." }), { status: 200, headers: jsonHeaders });
    }

    // 6. SIMILARITY SEARCH
    const scoredChunks = chunks.map((chunk, index) => {
      return {
        chunk,
        score: cosineSimilarity(queryEmbedding, chunkEmbeddings[index])
      };
    });

    scoredChunks.sort((a, b) => b.score - a.score);
    const topChunks = scoredChunks.slice(0, 3);
    const highestScore = topChunks[0]?.score || 0;
    
    console.log(`[RAG Chat] Highest embedding similarity score: ${highestScore}`);

    if (highestScore < 0.5) {
      console.log(`[RAG Chat] Similarity threshold not met.`);
      return new Response(JSON.stringify({ 
        answer: "This information is not available in the article."
      }), { status: 200, headers: jsonHeaders });
    }

    const contextHTML = topChunks.map(c => c.chunk).join('\n...\n');

    // 7. STRICT SYSTEM PROMPT
    const promptParams = {
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant that ONLY answers based on the given article context.\nDo NOT use external knowledge.\nIf answer is not found, say:\n'This information is not available in the article.'\n\nCONTEXT:\n${contextHTML}`
        },
        {
          role: 'user',
          content: question
        }
      ]
    };

    // 8. FINAL LLM CALL
    let response;
    try {
      response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', promptParams);
      console.log(`[RAG Chat] LLM responded successfully.`);
    } catch (llmError) {
      console.error('[RAG Chat] LLM Chat Error:', llmError.message, llmError.stack);
      return new Response(JSON.stringify({ answer: "This information is not available in the article." }), { status: 200, headers: jsonHeaders });
    }

    // 9. SUCCESS RESPONSE
    return new Response(JSON.stringify({ answer: response.response }), { status: 200, headers: jsonHeaders });

  } catch (globalError) {
    // 10. GLOBAL CATCH-ALL SAFEGUARD (NEVER RETURN 500)
    console.error('[RAG Chat] FATAL GLOBAL ERROR:', globalError.message, globalError.stack);
    return new Response(JSON.stringify({ answer: "This information is not available in the article." }), { status: 200, headers: jsonHeaders });
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
