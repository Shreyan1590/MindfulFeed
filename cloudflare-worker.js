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

      // ============ USER & ANALYTICS API ============

      // Create new post with AI Moderation
      if (path === '/api/posts' && request.method === 'POST') {
        return await handleCreatePost(request, env, corsHeaders);
      }

      // Get user profile
      const userMatch = path.match(/^\/api\/user\/(.+)$/);
      if (userMatch && request.method === 'GET') {
        return await handleGetUser(userMatch[1], env, corsHeaders);
      }

      // Track interaction (XP & Attention)
      if (path === '/api/interactions' && request.method === 'POST') {
        return await handleTrackInteraction(request, env, corsHeaders);
      }

      // ============ AUTH API ============

      // Login User
      if (path === '/api/login' && request.method === 'POST') {
        return await handleLogin(request, env, corsHeaders);
      }

      // Register User
      if (path === '/api/register' && request.method === 'POST') {
        return await handleRegister(request, env, corsHeaders);
      }
      
      // Guest/Demo Login
      if (path === '/api/login-demo' && (request.method === 'GET' || request.method === 'POST')) {
        return await handleDemoLogin(request, env, corsHeaders);
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
      return new Response(JSON.stringify({ error: 'Something went wrong. Please try again later.' }), {
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
    
    const systemPrompt = `You are Buddy, a hybrid AI assistant for MindfulFeed. 
Identity: Created by Dhilip K.
Goal: Balance article knowledge (RAG), conversational warmth, and user memory.

---
🌍 MULTILINGUAL (Auto-detect):
- Detect input language & reply natively in the same (English, Tamil, Hindi, Spanish, French).
- Tone: "Got it! Here is the info..." / "சரி! இதோ விளக்கம்..." / "¡Entendido! Aquí tienes..."

---
🧠 BEHAVIOR:
1. Be friendly/personal. Use name if known (e.g. "Hey Shreyan!").
2. Article-Aware: Use CONTEXT carefully. Simplify facts. Don't guess.
Priority: 1. User Info > 2. Article Context > 3. General Knowledge.
Style: Clear, concise, friendly.

---
CONTEXT:
${context}`;

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

    const aiRes = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: chatMessages,
      max_tokens: 300,
      temperature: 0.6
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

/**
 * Get User Profile
 */
async function handleGetUser(userId, env, corsHeaders) {
  const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };
  try {
    const user = await env.MINDFULFEED_DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: jsonHeaders });
    }
    return new Response(JSON.stringify(user), { status: 200, headers: jsonHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: jsonHeaders });
  }
}

/**
 * Handle new post creation with AI Moderation & Embeddings
 */
async function handleCreatePost(request, env, corsHeaders) {
  const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };
  try {
    const payload = await request.json();
    const { userId, title, caption, content, category, tags = [], imageUrl } = payload;

    if (!userId || !title || !content) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: jsonHeaders });
    }

    const db = env.MINDFULFEED_DB;

    // 1. Fetch User Data
    const user = await db.prepare('SELECT name, level FROM users WHERE id = ?').bind(userId).first();
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: jsonHeaders });
    }

    // 2. AI Content Moderation
    const moderationPrompt = `Analyze this article for "MindfulFeed" (a productivity social app).
Goal: Only allow meaningful, educational, and safe content. Reject spam/low-quality.

Article:
Title: ${title}
Body: ${content}

Respond strictly with JSON:
{
  "allowed": true/false,
  "quality": "productive" | "neutral" | "low-value",
  "score": 0.0-1.0,
  "feedback": "...",
  "suggestions": []
}`;

    const modRes = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [{ role: 'system', content: "You are a content quality expert." }, { role: 'user', content: moderationPrompt }],
      response_format: { type: 'json_object' }
    });

    const analysis = JSON.parse(modRes.response);
    if (!analysis.allowed) {
      return new Response(JSON.stringify({ error: "AI Moderation Rejected", analysis }), { status: 400, headers: jsonHeaders });
    }

    // 3. Save Post
    const postId = `post_${Date.now()}`;
    await db.prepare(`
      INSERT INTO posts (id, title, caption, content, category, tags, image_url, author_id, author_name, author_level, content_quality, attention_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      postId, title, caption, content, category, JSON.stringify(tags), imageUrl, 
      userId, user.name, user.level, analysis.quality, analysis.score
    ).run();

    // 4. Generate Embeddings (for RAG)
    const chunks = chunkText(content, 300, 50);
    const embeddingsRes = await env.AI.run('@cf/baai/bge-small-en-v1.5', { text: chunks });
    const embeddings = embeddingsRes.data;

    const embedBatch = chunks.map((chunk, i) => 
      db.prepare('INSERT INTO post_embeddings (post_id, chunk_text, embedding_vector) VALUES (?, ?, ?)')
        .bind(postId, chunk, JSON.stringify(embeddings[i]))
    );
    await db.batch(embedBatch);

    return new Response(JSON.stringify({ success: true, postId, analysis }), { status: 201, headers: jsonHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: jsonHeaders });
  }
}

/**
 * Track Interaction (Engagement, XP, Attention)
 */
async function handleTrackInteraction(request, env, corsHeaders) {
  const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };
  try {
    const { userId, postId, timeSpent, scrollDepth } = await request.json();
    const db = env.MINDFULFEED_DB;

    // Calculate XP
    let xpEarned = 0;
    if (timeSpent >= 30) xpEarned = 10;
    else if (timeSpent >= 10) xpEarned = 5;
    else if (timeSpent >= 5) xpEarned = 2;

    if (scrollDepth >= 0.9) xpEarned += 5; // Bonus for full read

    // 1. Log Interaction
    await db.prepare(`
      INSERT INTO interactions (user_id, post_id, time_spent, xp_earned, scroll_depth)
      VALUES (?, ?, ?, ?, ?)
    `).bind(userId, postId, timeSpent, xpEarned, scrollDepth).run();

    // 2. Update User XP & Level
    const userRes = await db.prepare('SELECT xp, level FROM users WHERE id = ?').bind(userId).first();
    let newXp = (userRes.xp || 0) + xpEarned;
    let newLevel = Math.floor(newXp / 100) + 1;

    await db.prepare('UPDATE users SET xp = ?, level = ? WHERE id = ?')
      .bind(newXp, newLevel, userId).run();

    // 3. Update Post Analytics
    await db.prepare('UPDATE posts SET views_count = views_count + 1, total_watch_time = total_watch_time + ? WHERE id = ?')
      .bind(timeSpent, postId).run();

    return new Response(JSON.stringify({ 
      success: true, 
      xp_earned: xpEarned, 
      new_xp: newXp,
      new_level: newLevel 
    }), { status: 200, headers: jsonHeaders });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: jsonHeaders });
  }
}

/**
 * Handle User Login
 */
async function handleLogin(request, env, corsHeaders) {
  const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };
  try {
    const { email, password } = await request.json();
    const sanitizedEmail = (email || '').trim().toLowerCase();
    const db = env.MINDFULFEED_DB;

    const user = await db.prepare('SELECT id, name, email, xp, level FROM users WHERE email = ? AND password = ?')
      .bind(sanitizedEmail, password).first();

    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid email or password" }), { status: 401, headers: jsonHeaders });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        xp: user.xp,
        level: user.level
      },
      token: `token_${Math.random().toString(36).substring(2)}` 
    }), { status: 200, headers: jsonHeaders });
  } catch (error) {
    console.error('[Auth] Login error:', error.message);
    // Return user-friendly message, never expose raw DB errors
    return new Response(JSON.stringify({ error: 'Unable to log in. Please check your email and password and try again.' }), { status: 500, headers: jsonHeaders });
  }
}

/**
 * Handle User Registration
 */
async function handleRegister(request, env, corsHeaders) {
  const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };
  try {
    const { name, email, password } = await request.json();
    const sanitizedEmail = (email || '').trim().toLowerCase();
    const sanitizedName = (name || '').trim();
    const db = env.MINDFULFEED_DB;

    // Check if user exists
    const existing = await db.prepare('SELECT id FROM users WHERE email = ?').bind(sanitizedEmail).first();
    if (existing) {
      return new Response(JSON.stringify({ error: "An account with this email already exists. Please log in instead." }), { status: 400, headers: jsonHeaders });
    }

    const userId = `user_${Date.now()}`;
    await db.prepare('INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)')
      .bind(userId, sanitizedName, sanitizedEmail, password).run();

    return new Response(JSON.stringify({ 
      success: true, 
      userId,
      message: "User created successfully" 
    }), { status: 201, headers: jsonHeaders });
  } catch (error) {
    console.error('[Auth] Register error:', error.message);
    // Return user-friendly message, never expose raw DB errors
    let friendlyMessage = 'Unable to create account. Please try again later.';
    if (error.message && error.message.includes('UNIQUE constraint')) {
      friendlyMessage = 'An account with this email already exists. Please log in instead.';
    }
    return new Response(JSON.stringify({ error: friendlyMessage }), { status: 500, headers: jsonHeaders });
  }
}

/**
 * Handle Demo/Guest Login
 */
async function handleDemoLogin(request, env, corsHeaders) {
  const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };
  
  // Return a simulated high-tier guest user
  const demoUser = {
    id: `demo_${Math.random().toString(36).substring(2, 9)}`,
    name: 'Cosmic Explorer (Guest)',
    email: 'guest@mindfulfeed.app',
    xp: 420,
    level: 5
  };

  return new Response(JSON.stringify({ 
    success: true, 
    user: demoUser,
    token: `demo_token_${Math.random().toString(36).substring(2)}`,
    isDemo: true 
  }), { status: 200, headers: jsonHeaders });
}
