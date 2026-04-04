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
    const path = url.pathname.replace(/\/+$/, "") || "/";

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
      // Root URL - friendly landing page / health check
      if (path === '/') {
        return new Response(JSON.stringify({
          status: 'ok',
          message: 'MindfulFeed Worker API is running',
          version: '1.2.1',
          endpoints: [
            '/api/posts',
            '/api/posts/:id',
            '/api/rag/chat',
            '/api/debug',
            '/health'
          ]
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Debug endpoint
      if (path === '/api/debug') {
        return new Response(JSON.stringify({
          status: 'debug',
          path: path,
          originalPath: url.pathname,
          method: request.method,
          headers: Object.fromEntries(request.headers.entries())
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

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

      // ============ POSTS API ============

      // Bulk upload posts
      if (path === '/api/posts/bulk-upload' && request.method === 'POST') {
        return await handleBulkUpload(request, env, corsHeaders);
      }

      // List all posts (feed)
      if (path === '/api/posts' && request.method === 'GET') {
        return await handleGetPosts(request, env, corsHeaders);
      }

      // Get single post by ID
      const postMatch = path.match(/^\/api\/posts\/(.+)$/);
      if (postMatch && request.method === 'GET') {
        return await handleGetPost(postMatch[1], env, corsHeaders);
      }

      // ============ RAG CHAT ============

      // RAG Chat Endpoint using Cloudflare Workers AI
      if (path === '/api/rag/chat' && request.method === 'POST') {
        return await handleRAGChat(request, env, corsHeaders);
      }

      return new Response(JSON.stringify({ 
        error: 'Route not found', 
        path: path,
        originalPath: url.pathname,
        method: request.method 
      }), { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
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

// ============ POSTS API HANDLERS ============

/**
 * GET /api/posts — List all posts for feed (excludes full content for performance)
 */
async function handleGetPosts(request, env, corsHeaders) {
  const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };
  try {
    const db = env.MINDFULFEED_DB;
    const result = await db.prepare(
      `SELECT id, title, caption, category, image_url, xp, attention_score, 
              content_quality, read_time, views, comments, author_name, 
              author_avatar, author_level, tags, created_at 
       FROM posts ORDER BY created_at DESC`
    ).all();

    const posts = result.results.map(row => ({
      ...row,
      tags: JSON.parse(row.tags || '[]'),
    }));

    return new Response(JSON.stringify({ posts }), { status: 200, headers: jsonHeaders });
  } catch (error) {
    console.error('[Posts] List error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: jsonHeaders });
  }
}

/**
 * GET /api/posts/:id — Get single post with full content
 */
async function handleGetPost(postId, env, corsHeaders) {
  const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };
  try {
    const db = env.MINDFULFEED_DB;
    const row = await db.prepare('SELECT * FROM posts WHERE id = ?').bind(postId).first();

    if (!row) {
      return new Response(JSON.stringify({ error: 'Post not found' }), { status: 404, headers: jsonHeaders });
    }

    const post = { ...row, tags: JSON.parse(row.tags || '[]') };
    return new Response(JSON.stringify({ post }), { status: 200, headers: jsonHeaders });
  } catch (error) {
    console.error('[Posts] Get error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: jsonHeaders });
  }
}

/**
 * POST /api/posts/bulk-upload — Bulk insert posts and precompute embeddings
 */
async function handleBulkUpload(request, env, corsHeaders) {
  const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };
  try {
    const posts = await request.json();
    if (!Array.isArray(posts) || posts.length === 0) {
      return new Response(JSON.stringify({ error: 'Expected array of posts' }), { status: 400, headers: jsonHeaders });
    }

    const db = env.MINDFULFEED_DB;
    console.log(`[Bulk Upload] Processing ${posts.length} posts...`);

    for (const p of posts) {
      const postId = p.id || `post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      
      // 1. Insert/Replace Post
      await db.prepare(
        `INSERT OR REPLACE INTO posts (id, title, caption, content, category, image_url, xp, attention_score, content_quality, read_time, views, comments, author_name, author_avatar, author_level, tags, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        postId, p.title, p.caption || '', p.content, p.category || 'General',
        p.image_url || '', p.xp || 10, p.attention_score || 0.85,
        p.content_quality || 'productive', p.read_time || '5 min read',
        p.views || 0, p.comments || 0,
        p.author_name || 'MindfulFeed Team', p.author_avatar || '',
        p.author_level || 1, JSON.stringify(p.tags || []),
        p.created_at || new Date().toISOString()
      ).run();

      // 2. Precompute Embeddings
      if (env.AI && p.content) {
        const chunks = chunkText(p.content, 300, 30);
        console.log(`[Bulk Upload] Post ${postId}: Generated ${chunks.length} chunks`);
        
        try {
          console.log(`[Bulk Upload] Post ${postId}: Calling AI.run for embeddings...`);
          const embeddingsRes = await env.AI.run('@cf/baai/bge-small-en-v1.5', { text: chunks });
          const embeddings = embeddingsRes.data;

          if (!embeddings || embeddings.length === 0) {
            console.error(`[Bulk Upload] Post ${postId}: AI returned NO embeddings!`);
            continue;
          }

          console.log(`[Bulk Upload] Post ${postId}: Received ${embeddings.length} vectors. Inserting into D1...`);
          const embedStmt = db.prepare(
            'INSERT INTO post_embeddings (post_id, chunk_text, embedding_vector) VALUES (?, ?, ?)'
          );
          
          const embedBatch = chunks.map((chunk, i) => 
            embedStmt.bind(postId, chunk, JSON.stringify(embeddings[i]))
          );
          
          // Clear old embeddings and batch insert new ones
          await db.prepare('DELETE FROM post_embeddings WHERE post_id = ?').bind(postId).run();
          const batchRes = await db.batch(embedBatch);
          console.log(`[Bulk Upload] Post ${postId}: D1 Batch Success. Inserted ${batchRes.length} rows.`);
        } catch (e) {
          console.error(`[Bulk Upload] Post ${postId}: Fatal error during embeddings:`, e.name, e.message);
        }
      } else {
        console.warn(`[Bulk Upload] Post ${postId}: Skipping embeddings (env.AI: ${!!env.AI}, hasContent: ${!!p.content})`);
      }
    }

    return new Response(JSON.stringify({ success: true, count: posts.length }), { status: 200, headers: jsonHeaders });
  } catch (error) {
    console.error('[Posts] Bulk upload error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: jsonHeaders });
  }
}

// ============ RAG CHAT ============

/**
 * Handle RAG Chat Question
 * Optimized: Uses precomputed embeddings + lightweight model
 */
async function handleRAGChat(request, env, corsHeaders) {
  const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };
  try {
    const payload = await request.json();
    const { postId, question, history = [] } = payload;

    if (!postId || !question) {
      return new Response(JSON.stringify({ error: "Missing postId or question" }), { status: 400, headers: jsonHeaders });
    }

    const ragTotalStart = Date.now();
    console.time("RAG_TOTAL");
    const db = env.MINDFULFEED_DB;
    
    // 1. Fetch Article Metadata
    const articleRow = await db.prepare('SELECT title FROM posts WHERE id = ?').bind(postId).first();
    if (!articleRow) {
      return new Response(JSON.stringify({ error: "Post not found" }), { status: 404, headers: jsonHeaders });
    }

    let context = '';
    let retrievalMethod = 'precomputed';
    let retrievalTime = 0;

    // 2. RETRIEVAL (Search stored embeddings)
    if (env.AI) {
      console.time("RETRIEVAL");
      const retrievalStart = Date.now();
      try {
        const [storedEmbeddingsRes, queryEmbeddingRes] = await Promise.all([
          db.prepare('SELECT chunk_text, embedding_vector FROM post_embeddings WHERE post_id = ?').bind(postId).all(),
          env.AI.run('@cf/baai/bge-small-en-v1.5', { text: [question] })
        ]);

        const storedEmbeddings = storedEmbeddingsRes.results;
        const queryVector = queryEmbeddingRes.data[0];

        if (storedEmbeddings.length > 0) {
          const scores = storedEmbeddings.map(row => ({
            text: row.chunk_text,
            score: cosineSimilarity(queryVector, JSON.parse(row.embedding_vector))
          }));

          scores.sort((a, b) => b.score - a.score);
          context = scores.slice(0, 3).map(s => s.text).join('\n\n');
        } else {
          context = `Title: ${articleRow.title}`;
          retrievalMethod = 'meta-only';
        }
      } catch (e) {
        console.error('[RAG] Retrieval Error:', e.message);
        retrievalMethod = 'error';
      }
      retrievalTime = Date.now() - retrievalStart;
      console.timeEnd("RETRIEVAL");
    }

    // 3. INFERENCE (Hybrid AI Assistant: Conversation + RAG + Memory)
    console.time("INFERENCE");
    const inferenceStart = Date.now();
    
    const systemPrompt = `You are an intelligent AI assistant designed for a hybrid conversational system that combines:
* RAG (article-based knowledge)
* Conversational interaction
* User memory (personalization)

Your role is to balance knowledge accuracy with natural conversation.

---
🧠 CORE BEHAVIOR (OPERATE IN THREE MODES):

1. CONVERSATIONAL MODE (casual interaction)
   - If greeting, personal talk, or simple chat: Response naturally and friendly.
   - Use user's name if available (e.g. "Hey Shreyan! 👋").

2. ARTICLE-AWARE MODE (RAG)
   - If question is article-related: Use CONTEXT as primary source.
   - Answer clearly, simplify explanations.
   - Avoid guessing or hallucinating unknown parts.

3. HYBRID MODE
   - If mixing casual + article: Start conversational, then provide the answer.
   - Example: "Good question! Based on the article, AI is mainly used for..."

---
🧠 MEMORY & CONTEXT PRIORITY:
1. User-provided information (highest priority - e.g. "My name is Shreyan")
2. Article context (provided below)
3. General knowledge (limited use, only if needed for clarity)

---
🚫 STRICT RULES:
- Do NOT behave like a strict robot.
- Do NOT say "not available" unnecessarily if you can help explain or bridge the gap.
- Do NOT ignore user tone.
- Do NOT add filler greetings repeatedly.

---
CONTEXT:
${context}
---
ANSWER STYLE: Friendly but intelligent, clear, structured, not too long.`;

    // Construct message history for LLM
    const chatMessages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add conversation history (last 8 messages for better memory/personalization)
    if (Array.isArray(history) && history.length > 0) {
      chatMessages.push(...history.slice(-8));
    }

    // Finally add the current user input as the last message
    chatMessages.push({ role: 'user', content: question });

    const aiRes = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: chatMessages,
      max_tokens: 450, // Slightly more room for hybrid responses
      temperature: 0.7 // Better for conversational flow
    });
    
    const inferenceTime = Date.now() - inferenceStart;
    console.timeEnd("INFERENCE");
    
    const totalTime = Date.now() - ragTotalStart;
    console.timeEnd("RAG_TOTAL");

    return new Response(JSON.stringify({ 
      answer: aiRes.response,
      method: retrievalMethod,
      articleTitle: articleRow.title,
      metrics: {
        retrieval_ms: retrievalTime,
        inference_ms: inferenceTime,
        total_ms: totalTime
      }
    }), { status: 200, headers: jsonHeaders });

  } catch (error) {
    console.error('[RAG Chat] FATAL ERROR:', error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: jsonHeaders });
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
