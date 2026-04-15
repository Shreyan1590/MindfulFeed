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
                    version: '1.3.0',
                    endpoints: [
                        '/api/posts',
                        '/api/posts/analyze',
                        '/api/posts/:id',
                        '/api/rag/chat',
                        '/api/login',
                        '/api/register',
                        '/api/auth/google',
                        '/api/debug',
                        '/health'
                    ]
                }), {
                    headers: {...corsHeaders, 'Content-Type': 'application/json' },
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
                    headers: {...corsHeaders, 'Content-Type': 'application/json' },
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
                    headers: {...corsHeaders, 'Content-Type': 'application/json' },
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

            // Analyze a post before publishing
            if (path === '/api/posts/analyze' && request.method === 'POST') {
                return await handleAnalyzePost(request, env, corsHeaders);
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

            // Google Sign In / Sign Up
            if (path === '/api/auth/google' && request.method === 'POST') {
                return await handleGoogleAuth(request, env, corsHeaders);
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
                headers: {...corsHeaders, 'Content-Type': 'application/json' }
            });
        } catch (error) {
            console.error('Worker Error:', error);
            return new Response(JSON.stringify({ error: 'Something went wrong. Please try again later.' }), {
                status: 500,
                headers: {...corsHeaders, 'Content-Type': 'application/json' },
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
            }), {
                status: 200,
                headers: {...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }), {
                status: 500,
                headers: {...corsHeaders, 'Content-Type': 'application/json' },
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
            JSON.stringify({ error: error.message }), {
                status: 500,
                headers: {...corsHeaders, 'Content-Type': 'application/json' },
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
            JSON.stringify({ success: true }), {
                status: 200,
                headers: {...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }), {
                status: 500,
                headers: {...corsHeaders, 'Content-Type': 'application/json' },
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
        const result = params ?
            await db.prepare(sql).bind(...params).all() :
            await db.prepare(sql).all();

        return new Response(
            JSON.stringify({
                success: true,
                result: result.results,
                meta: result.meta,
            }), {
                status: 200,
                headers: {...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }), {
                status: 500,
                headers: {...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    }
}

function safeParseJson(value, fallback) {
    if (typeof value !== 'string' || value.trim() === '') {
        return fallback;
    }

    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
}

function toNumber(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function toInteger(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.round(parsed) : fallback;
}

function clampScore(value) {
    const numeric = toNumber(value, 0.75);
    return Math.max(0, Math.min(1, numeric));
}

function estimateReadTime(text = '') {
    const words = String(text).trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
}

async function getTableColumns(db, tableName) {
    const tableInfo = await db.prepare(`PRAGMA table_info(${tableName})`).all();
    return new Set((tableInfo.results || []).map((column) => column.name));
}

async function insertCompatibleRow(db, tableName, data, tableColumns) {
    const entries = Object.entries(data).filter(([column, value]) =>
        tableColumns.has(column) && value !== undefined
    );

    if (entries.length === 0) {
        throw new Error(`No compatible columns found for ${tableName}.`);
    }

    const columns = entries.map(([column]) => column).join(', ');
    const placeholders = entries.map(() => '?').join(', ');
    const values = entries.map(([, value]) => value);

    await db.prepare(`INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`).bind(...values).run();
}

function buildPostSelectList(postColumns, includeContent = false) {
    const selectColumns = [
        'id',
        'title',
        postColumns.has('caption') ? 'caption' : "'' AS caption",
        ...(includeContent ? ['content'] : []),
        postColumns.has('category') ? 'category' : "'' AS category",
        postColumns.has('image_url') ? 'image_url' : "'' AS image_url",
        postColumns.has('xp') ? 'xp' : '0 AS xp',
        postColumns.has('attention_score') ? 'attention_score' : '0 AS attention_score',
        postColumns.has('content_quality') ? 'content_quality' : "'neutral' AS content_quality",
        postColumns.has('read_time') ? 'read_time' : "'1 min read' AS read_time",
        postColumns.has('views') ? 'views' : (postColumns.has('views_count') ? 'views_count AS views' : '0 AS views'),
        postColumns.has('comments') ? 'comments' : (postColumns.has('comments_count') ? 'comments_count AS comments' : '0 AS comments'),
        postColumns.has('author_name') ? 'author_name' : "'MindfulFeed Team' AS author_name",
        postColumns.has('author_avatar') ? 'author_avatar' : 'NULL AS author_avatar',
        postColumns.has('author_level') ? 'author_level' : '1 AS author_level',
        postColumns.has('tags') ? 'tags' : "'[]' AS tags",
        postColumns.has('created_at') ? 'created_at' : "datetime('now') AS created_at",
    ];

    return selectColumns.join(', ');
}

function getNormalizedXp(user) {
    return toInteger(user.total_xp ? ? user.xp, 0);
}

function getNormalizedLevel(user, xp = getNormalizedXp(user)) {
    const rawLevel = toNumber(user.level, NaN);

    if (Number.isFinite(rawLevel) && rawLevel >= 1) {
        return Math.max(1, Math.floor(rawLevel));
    }

    return Math.max(1, Math.floor(xp / 100) + 1);
}

function getNormalizedUserName(user) {
    return user.display_name || user.name || (user.email ? user.email.split('@')[0] : 'Explorer');
}

function buildUserPayload(user) {
    const xp = getNormalizedXp(user);
    const level = getNormalizedLevel(user, xp);

    return {
        id: user.id,
        email: user.email,
        name: getNormalizedUserName(user),
        photo_url: user.photo_url || null,
        xp,
        level,
        attention_score: clampScore(user.attention_score ? ? 0),
        badges: Array.isArray(user.badges) ? user.badges : safeParseJson(user.badges, []),
        current_streak: toInteger(user.current_streak, 0),
        best_streak: toInteger(user.best_streak, 0),
        mode: user.mode || 'growth',
    };
}

async function ensureUserSchema(db) {
    await db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      password_hash TEXT,
      display_name TEXT,
      photo_url TEXT,
      total_xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      current_streak INTEGER DEFAULT 0,
      best_streak INTEGER DEFAULT 0,
      last_active_date TEXT,
      attention_score REAL DEFAULT 0,
      mode TEXT DEFAULT 'growth',
      auth_token TEXT,
      password TEXT,
      name TEXT,
      xp INTEGER DEFAULT 0,
      badges TEXT DEFAULT '[]'
    )
  `).run();

    const columns = await getTableColumns(db, 'users');
    const authMigrations = [];
    const compatibilityColumns = {
        email: 'TEXT',
        password_hash: 'TEXT',
        display_name: 'TEXT',
        photo_url: 'TEXT',
        total_xp: 'INTEGER DEFAULT 0',
        current_streak: 'INTEGER DEFAULT 0',
        best_streak: 'INTEGER DEFAULT 0',
        last_active_date: 'TEXT',
        mode: "TEXT DEFAULT 'growth'",
        auth_token: 'TEXT',
        password: 'TEXT',
        name: 'TEXT',
        xp: 'INTEGER DEFAULT 0',
        badges: "TEXT DEFAULT '[]'",
    };

    for (const [column, definition] of Object.entries(compatibilityColumns)) {
        if (!columns.has(column)) {
            authMigrations.push(db.prepare(`ALTER TABLE users ADD COLUMN ${column} ${definition}`));
            columns.add(column);
        }
    }

    if (authMigrations.length > 0) {
        await db.batch(authMigrations);
    }

    await db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email)').run();
    return columns;
}

async function ensureInteractionSchema(db) {
    await db.prepare(`
    CREATE TABLE IF NOT EXISTS interactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      post_id TEXT NOT NULL,
      category TEXT,
      is_like INTEGER DEFAULT 0,
      watch_time_seconds INTEGER DEFAULT 0,
      time_spent INTEGER DEFAULT 0,
      xp_earned INTEGER DEFAULT 0,
      scroll_depth REAL DEFAULT 0,
      timestamp TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (post_id) REFERENCES posts(id)
    )
  `).run();

    const columns = await getTableColumns(db, 'interactions');
    const migrations = [];
    const compatibilityColumns = {
        category: 'TEXT',
        is_like: 'INTEGER DEFAULT 0',
        watch_time_seconds: 'INTEGER DEFAULT 0',
        time_spent: 'INTEGER DEFAULT 0',
        xp_earned: 'INTEGER DEFAULT 0',
        scroll_depth: 'REAL DEFAULT 0',
    };

    for (const [column, definition] of Object.entries(compatibilityColumns)) {
        if (!columns.has(column)) {
            migrations.push(db.prepare(`ALTER TABLE interactions ADD COLUMN ${column} ${definition}`));
            columns.add(column);
        }
    }

    if (migrations.length > 0) {
        await db.batch(migrations);
    }

    return columns;
}

function buildUserSelectList(userColumns) {
    const preferredColumns = [
        'id',
        'email',
        'password_hash',
        'password',
        'display_name',
        'name',
        'photo_url',
        'total_xp',
        'xp',
        'level',
        'attention_score',
        'mode',
        'current_streak',
        'best_streak',
        'last_active_date',
        'badges',
        'auth_token',
    ];

    return preferredColumns.filter((column) => userColumns.has(column)).join(', ');
}

async function fetchUserByEmail(db, userColumns, email) {
    return db.prepare(`SELECT ${buildUserSelectList(userColumns)} FROM users WHERE email = ?`)
        .bind(email)
        .first();
}

async function fetchUserById(db, userColumns, userId) {
    return db.prepare(`SELECT ${buildUserSelectList(userColumns)} FROM users WHERE id = ?`)
        .bind(userId)
        .first();
}

function bytesToHex(bytes) {
    return Array.from(bytes).map((value) => value.toString(16).padStart(2, '0')).join('');
}

async function sha256Hex(input) {
    const data = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return bytesToHex(new Uint8Array(digest));
}

async function hashPassword(password) {
    const salt = bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
    const digest = await sha256Hex(`${salt}:${password}`);
    return `sha256$${salt}$${digest}`;
}

async function verifyPasswordValue(password, storedValue) {
    if (!storedValue) {
        return false;
    }

    if (storedValue.startsWith('sha256$')) {
        const [, salt, digest] = storedValue.split('$');
        if (!salt || !digest) {
            return false;
        }
        return (await sha256Hex(`${salt}:${password}`)) === digest;
    }

    return storedValue === password;
}

async function verifyUserPassword(password, user) {
    const candidates = [user.password_hash, user.password].filter(Boolean);

    for (const candidate of candidates) {
        if (await verifyPasswordValue(password, candidate)) {
            return {
                matches: true,
                needsUpgrade: !candidate.startsWith('sha256$') || (user.password && user.password !== user.password_hash),
            };
        }
    }

    return { matches: false, needsUpgrade: false };
}

async function upgradePasswordStorage(db, userColumns, userId, password) {
    const hashedPassword = await hashPassword(password);
    const assignments = [];
    const params = [];

    if (userColumns.has('password_hash')) {
        assignments.push('password_hash = ?');
        params.push(hashedPassword);
    }

    if (userColumns.has('password')) {
        assignments.push('password = ?');
        params.push(hashedPassword);
    }

    if (assignments.length > 0) {
        await db.prepare(`UPDATE users SET ${assignments.join(', ')} WHERE id = ?`)
            .bind(...params, userId)
            .run();
    }

    return hashedPassword;
}

async function persistUserSession(db, userColumns, userId, token) {
    const assignments = [];
    const params = [];

    if (userColumns.has('auth_token')) {
        assignments.push('auth_token = ?');
        params.push(token);
    }

    if (userColumns.has('last_active_date')) {
        assignments.push('last_active_date = ?');
        params.push(new Date().toISOString().slice(0, 10));
    }

    if (assignments.length > 0) {
        await db.prepare(`UPDATE users SET ${assignments.join(', ')} WHERE id = ?`)
            .bind(...params, userId)
            .run();
    }
}

async function fetchGoogleProfile(idToken, env) {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);

    if (!response.ok) {
        throw new Error('Invalid Google credential.');
    }

    const profile = await response.json();

    const googleClientId = env.GOOGLE_WEB_CLIENT_ID || '87314678313-3gqqqeo2krfilu6uo5s2m4auraune9ji.apps.googleusercontent.com';

    if (profile.aud !== googleClientId) {
        throw new Error('Google client ID mismatch.');
    }

    if (profile.email_verified !== 'true') {
        throw new Error('Google email is not verified.');
    }

    return {
        email: String(profile.email || '').trim().toLowerCase(),
        name: String(profile.name || profile.given_name || '').trim(),
        photoUrl: profile.picture || null,
        googleSubject: profile.sub || null,
    };
}

async function upsertGoogleUser(db, userColumns, profile) {
    const existingUser = await fetchUserByEmail(db, userColumns, profile.email);

    if (existingUser) {
        const assignments = [];
        const params = [];

        if (userColumns.has('display_name') && profile.name && !existingUser.display_name) {
            assignments.push('display_name = ?');
            params.push(profile.name);
        }

        if (userColumns.has('name') && profile.name && !existingUser.name) {
            assignments.push('name = ?');
            params.push(profile.name);
        }

        if (userColumns.has('photo_url') && profile.photoUrl && !existingUser.photo_url) {
            assignments.push('photo_url = ?');
            params.push(profile.photoUrl);
        }

        if (assignments.length > 0) {
            await db.prepare(`UPDATE users SET ${assignments.join(', ')} WHERE id = ?`)
                .bind(...params, existingUser.id)
                .run();
        }

        return fetchUserById(db, userColumns, existingUser.id);
    }

    const userId = crypto.randomUUID();
    await insertCompatibleRow(db, 'users', {
        id: userId,
        email: profile.email,
        display_name: profile.name || profile.email.split('@')[0],
        name: profile.name || profile.email.split('@')[0],
        photo_url: profile.photoUrl,
        total_xp: 0,
        xp: 0,
        level: 1,
        current_streak: 0,
        best_streak: 0,
        last_active_date: new Date().toISOString().slice(0, 10),
        attention_score: 0,
        mode: 'growth',
        badges: '[]',
    }, userColumns);

    return fetchUserById(db, userColumns, userId);
}

async function analyzeContentQuality({ title, content, category }, env) {
    if (!env.AI) {
        return {
            allowed: true,
            quality: 'neutral',
            score: 0.75,
            feedback: 'AI analysis is temporarily unavailable, so we used basic safety checks instead.',
            suggestions: [],
        };
    }

    const moderationPrompt = `Analyze this article for "MindfulFeed" (a productivity social app).
Goal: Only allow meaningful, educational, and safe content. Reject spam or low-quality entries.

Article:
Title: ${title}
Category: ${category || 'General'}
Body: ${content}

Respond strictly with JSON:
{
  "allowed": true,
  "quality": "productive" | "neutral" | "low-value",
  "score": 0.0-1.0,
  "feedback": "Short feedback for the author",
  "suggestions": ["Suggestion 1"]
}`;

    try {
        const moderationResult = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
            messages: [
                { role: 'system', content: 'You are a content quality expert.' },
                { role: 'user', content: moderationPrompt },
            ],
            response_format: { type: 'json_object' },
        });

        const parsed = safeParseJson(moderationResult.response, {});
        const suggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
        const normalizedQuality = ['productive', 'neutral', 'low-value'].includes(parsed.quality) ? parsed.quality : 'neutral';
        const allowed = parsed.allowed !== false;

        return {
            allowed,
            quality: allowed ? normalizedQuality : 'harmful',
            score: clampScore(parsed.score),
            feedback: parsed.feedback || 'Your content is ready to publish.',
            suggestions: suggestions.map((suggestion) => String(suggestion)),
        };
    } catch (error) {
        console.error('[AI] Content analysis error:', error.message);
        return {
            allowed: true,
            quality: 'neutral',
            score: 0.72,
            feedback: 'We could not complete the full AI review, but the post passed the fallback checks.',
            suggestions: [],
        };
    }
}

// ============ POSTS API HANDLERS ============

/**
 * GET /api/posts — List all posts for feed (excludes full content for performance)
 */
async function handleGetPosts(request, env, corsHeaders) {
    const jsonHeaders = {...corsHeaders, 'Content-Type': 'application/json' };
    try {
        const db = env.MINDFULFEED_DB;
        const postColumns = await getTableColumns(db, 'posts');
        const orderColumn = postColumns.has('created_at') ? 'created_at' : 'id';
        const result = await db.prepare(
            `SELECT ${buildPostSelectList(postColumns)} FROM posts ORDER BY ${orderColumn} DESC`
        ).all();

        const posts = result.results.map(row => ({
            ...row,
            xp: toInteger(row.xp, 0),
            attention_score: clampScore(row.attention_score),
            author_level: toInteger(row.author_level, 1),
            tags: safeParseJson(row.tags, []),
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
    const jsonHeaders = {...corsHeaders, 'Content-Type': 'application/json' };
    try {
        const db = env.MINDFULFEED_DB;
        const postColumns = await getTableColumns(db, 'posts');
        const row = await db.prepare(
            `SELECT ${buildPostSelectList(postColumns, true)} FROM posts WHERE id = ?`
        ).bind(postId).first();

        if (!row) {
            return new Response(JSON.stringify({ error: 'Post not found' }), { status: 404, headers: jsonHeaders });
        }

        const post = {
            ...row,
            xp: toInteger(row.xp, 0),
            attention_score: clampScore(row.attention_score),
            author_level: toInteger(row.author_level, 1),
            tags: safeParseJson(row.tags, []),
        };
        return new Response(JSON.stringify({ post }), { status: 200, headers: jsonHeaders });
    } catch (error) {
        console.error('[Posts] Get error:', error.message);
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: jsonHeaders });
    }
}

/**
 * POST /api/posts/analyze — Run moderation without creating a post
 */
async function handleAnalyzePost(request, env, corsHeaders) {
    const jsonHeaders = {...corsHeaders, 'Content-Type': 'application/json' };

    try {
        const payload = await request.json();
        const { title, content, category } = payload;

        if (!title || !content || !category) {
            return new Response(JSON.stringify({ error: 'Title, content, and category are required.' }), {
                status: 400,
                headers: jsonHeaders,
            });
        }

        const analysis = await analyzeContentQuality({ title, content, category }, env);
        return new Response(JSON.stringify({ success: true, analysis }), { status: 200, headers: jsonHeaders });
    } catch (error) {
        console.error('[Posts] Analyze error:', error.message);
        return new Response(JSON.stringify({ error: 'Unable to analyze content right now.' }), {
            status: 500,
            headers: jsonHeaders,
        });
    }
}

/**
 * POST /api/posts/bulk-upload — Bulk insert posts and precompute embeddings
 */
async function handleBulkUpload(request, env, corsHeaders) {
    const jsonHeaders = {...corsHeaders, 'Content-Type': 'application/json' };
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
    const jsonHeaders = {...corsHeaders, 'Content-Type': 'application/json' };
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
    const jsonHeaders = {...corsHeaders, 'Content-Type': 'application/json' };
    try {
        const db = env.MINDFULFEED_DB;
        const userColumns = await ensureUserSchema(db);
        const user = await fetchUserById(db, userColumns, userId);

        if (!user) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: jsonHeaders });
        }

        return new Response(JSON.stringify(buildUserPayload(user)), { status: 200, headers: jsonHeaders });
    } catch (error) {
        console.error('[User] Fetch error:', error.message);
        return new Response(JSON.stringify({ error: 'Unable to fetch user profile right now.' }), { status: 500, headers: jsonHeaders });
    }
}

/**
 * Handle new post creation with AI Moderation & Embeddings
 */
async function handleCreatePost(request, env, corsHeaders) {
    const jsonHeaders = {...corsHeaders, 'Content-Type': 'application/json' };
    try {
        const payload = await request.json();
        const { userId, title, caption, content, category, tags = [], imageUrl } = payload;

        if (!title || !content || !category) {
            return new Response(JSON.stringify({ error: "Title, content, and category are required." }), { status: 400, headers: jsonHeaders });
        }

        const db = env.MINDFULFEED_DB;
        const userColumns = await ensureUserSchema(db);
        const postColumns = await getTableColumns(db, 'posts');

        let authorName = payload.authorName || 'MindfulFeed Team';
        let authorLevel = 1;
        let authorAvatar = payload.authorAvatar || null;

        if (userId) {
            const user = await fetchUserById(db, userColumns, userId);
            if (user) {
                const normalizedUser = buildUserPayload(user);
                authorName = normalizedUser.name;
                authorLevel = normalizedUser.level;
                authorAvatar = normalizedUser.photo_url;
            } else if (!String(userId).startsWith('demo_')) {
                return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: jsonHeaders });
            }
        }

        const analysis = await analyzeContentQuality({ title, content, category }, env);
        if (!analysis.allowed) {
            return new Response(JSON.stringify({ error: "AI Moderation Rejected", analysis }), { status: 400, headers: jsonHeaders });
        }

        // 1. Save Post
        const postId = `post_${Date.now()}`;
        await insertCompatibleRow(db, 'posts', {
            id: postId,
            title,
            caption: caption || '',
            content,
            category,
            tags: JSON.stringify(Array.isArray(tags) ? tags : []),
            image_url: imageUrl || '',
            author_id: userId,
            author_name: authorName,
            author_avatar: authorAvatar,
            author_level: authorLevel,
            xp: 10,
            attention_score: analysis.score,
            content_quality: analysis.quality,
            read_time: estimateReadTime(content),
            views: 0,
            comments: 0,
            views_count: 0,
            comments_count: 0,
            total_watch_time: 0,
            created_at: new Date().toISOString(),
        }, postColumns);

        // 2. Generate embeddings opportunistically so publishing doesn't fail if AI embeddings do.
        if (env.AI) {
            try {
                const chunks = chunkText(content, 300, 50);
                const embeddingsRes = await env.AI.run('@cf/baai/bge-small-en-v1.5', { text: chunks });
                const embeddings = Array.isArray(embeddingsRes ? .data) ? embeddingsRes.data : [];

                if (embeddings.length > 0) {
                    const embedBatch = chunks.map((chunk, index) =>
                        db.prepare('INSERT INTO post_embeddings (post_id, chunk_text, embedding_vector) VALUES (?, ?, ?)')
                        .bind(postId, chunk, JSON.stringify(embeddings[index]))
                    );
                    await db.batch(embedBatch);
                }
            } catch (embeddingError) {
                console.error('[Posts] Embedding generation error:', embeddingError.message);
            }
        }

        return new Response(JSON.stringify({ success: true, postId, analysis }), { status: 201, headers: jsonHeaders });
    } catch (error) {
        console.error('[Posts] Create error:', error.message);
        return new Response(JSON.stringify({ error: 'Unable to publish this post right now.' }), { status: 500, headers: jsonHeaders });
    }
}

/**
 * Track Interaction (Engagement, XP, Attention)
 */
async function handleTrackInteraction(request, env, corsHeaders) {
    const jsonHeaders = {...corsHeaders, 'Content-Type': 'application/json' };
    try {
        const { userId, postId, timeSpent, scrollDepth } = await request.json();
        const db = env.MINDFULFEED_DB;
        const interactionColumns = await ensureInteractionSchema(db);
        const userColumns = await ensureUserSchema(db);
        const postColumns = await getTableColumns(db, 'posts');
        const watchedSeconds = Math.max(0, toInteger(timeSpent, 0));
        const normalizedScrollDepth = Math.max(0, Math.min(1, toNumber(scrollDepth, 0)));
        const isRegisteredUser = !!userId && !String(userId).startsWith('demo_');
        const trackedUser = isRegisteredUser ? await fetchUserById(db, userColumns, userId) : null;

        // Calculate XP
        let xpEarned = 0;
        if (watchedSeconds >= 30) xpEarned = 10;
        else if (watchedSeconds >= 10) xpEarned = 5;
        else if (watchedSeconds >= 5) xpEarned = 2;

        if (normalizedScrollDepth >= 0.9) xpEarned += 5;

        const post = await db.prepare('SELECT category FROM posts WHERE id = ?').bind(postId).first();
        if (!post) {
            return new Response(JSON.stringify({ error: 'Post not found' }), { status: 404, headers: jsonHeaders });
        }

        if (trackedUser) {
            await insertCompatibleRow(db, 'interactions', {
                id: crypto.randomUUID(),
                user_id: userId,
                post_id: postId,
                category: post.category || 'General',
                is_like: 0,
                watch_time_seconds: watchedSeconds,
                time_spent: watchedSeconds,
                xp_earned: xpEarned,
                scroll_depth: normalizedScrollDepth,
                timestamp: new Date().toISOString(),
            }, interactionColumns);
        }

        let newXp = 0;
        let newLevel = 1;

        if (trackedUser) {
            newXp = getNormalizedXp(trackedUser) + xpEarned;
            newLevel = getNormalizedLevel(trackedUser, newXp);

            const assignments = [];
            const params = [];

            if (userColumns.has('total_xp')) {
                assignments.push('total_xp = ?');
                params.push(newXp);
            }

            if (userColumns.has('xp')) {
                assignments.push('xp = ?');
                params.push(newXp);
            }

            if (userColumns.has('level')) {
                assignments.push('level = ?');
                params.push(newLevel);
            }

            if (userColumns.has('last_active_date')) {
                assignments.push('last_active_date = ?');
                params.push(new Date().toISOString().slice(0, 10));
            }

            if (assignments.length > 0) {
                await db.prepare(`UPDATE users SET ${assignments.join(', ')} WHERE id = ?`)
                    .bind(...params, userId)
                    .run();
            }
        }

        const postUpdates = [];
        const postUpdateParams = [];

        if (postColumns.has('views')) {
            postUpdates.push('views = COALESCE(views, 0) + 1');
        }

        if (postColumns.has('views_count')) {
            postUpdates.push('views_count = COALESCE(views_count, 0) + 1');
        }

        if (postColumns.has('total_watch_time')) {
            postUpdates.push('total_watch_time = COALESCE(total_watch_time, 0) + ?');
            postUpdateParams.push(watchedSeconds);
        }

        if (postUpdates.length > 0) {
            await db.prepare(`UPDATE posts SET ${postUpdates.join(', ')} WHERE id = ?`)
                .bind(...postUpdateParams, postId)
                .run();
        }

        return new Response(JSON.stringify({
            success: true,
            xp_earned: xpEarned,
            new_xp: newXp,
            new_level: newLevel
        }), { status: 200, headers: jsonHeaders });

    } catch (error) {
        console.error('[Interactions] Track error:', error.message);
        return new Response(JSON.stringify({ error: 'Unable to record this interaction right now.' }), { status: 500, headers: jsonHeaders });
    }
}

/**
 * Handle User Login
 */
async function handleLogin(request, env, corsHeaders) {
    const jsonHeaders = {...corsHeaders, 'Content-Type': 'application/json' };
    try {
        const { email, password } = await request.json();
        const sanitizedEmail = (email || '').trim().toLowerCase();
        const db = env.MINDFULFEED_DB;
        const userColumns = await ensureUserSchema(db);

        if (!sanitizedEmail || !password) {
            return new Response(JSON.stringify({ error: "Email and password are required." }), { status: 400, headers: jsonHeaders });
        }

        const user = await fetchUserByEmail(db, userColumns, sanitizedEmail);

        if (!user) {
            return new Response(JSON.stringify({ error: "No account found with this email. Please sign up first." }), { status: 401, headers: jsonHeaders });
        }

        const passwordCheck = await verifyUserPassword(password, user);
        if (!passwordCheck.matches) {
            return new Response(JSON.stringify({ error: "Incorrect password. Please try again." }), { status: 401, headers: jsonHeaders });
        }

        if (passwordCheck.needsUpgrade) {
            await upgradePasswordStorage(db, userColumns, user.id, password);
        }

        const token = crypto.randomUUID();
        await persistUserSession(db, userColumns, user.id, token);

        return new Response(JSON.stringify({
            success: true,
            user: buildUserPayload(user),
            token,
        }), { status: 200, headers: jsonHeaders });
    } catch (error) {
        console.error('[Auth] Login error:', error.message);
        return new Response(JSON.stringify({ error: 'Unable to log in. Please try again later.' }), { status: 500, headers: jsonHeaders });
    }
}

/**
 * Handle User Registration
 */
async function handleRegister(request, env, corsHeaders) {
    const jsonHeaders = {...corsHeaders, 'Content-Type': 'application/json' };
    try {
        const { name, email, password } = await request.json();
        const sanitizedEmail = (email || '').trim().toLowerCase();
        const sanitizedName = (name || '').trim();
        const db = env.MINDFULFEED_DB;
        const userColumns = await ensureUserSchema(db);

        if (!sanitizedName || !sanitizedEmail || !password) {
            return new Response(JSON.stringify({ error: "Name, email, and password are required." }), { status: 400, headers: jsonHeaders });
        }

        if (password.length < 6) {
            return new Response(JSON.stringify({ error: "Password must be at least 6 characters." }), { status: 400, headers: jsonHeaders });
        }

        const existing = await fetchUserByEmail(db, userColumns, sanitizedEmail);
        if (existing) {
            return new Response(JSON.stringify({ error: "An account with this email already exists. Please log in instead." }), { status: 400, headers: jsonHeaders });
        }

        const userId = crypto.randomUUID();
        const token = crypto.randomUUID();
        const hashedPassword = await hashPassword(password);

        await insertCompatibleRow(db, 'users', {
            id: userId,
            email: sanitizedEmail,
            password_hash: hashedPassword,
            password: hashedPassword,
            display_name: sanitizedName,
            name: sanitizedName,
            total_xp: 0,
            xp: 0,
            level: 1,
            current_streak: 0,
            best_streak: 0,
            last_active_date: new Date().toISOString().slice(0, 10),
            attention_score: 0,
            mode: 'growth',
            auth_token: token,
            badges: '[]',
        }, userColumns);

        const createdUser = await fetchUserById(db, userColumns, userId);

        return new Response(JSON.stringify({
            success: true,
            userId,
            user: createdUser ? buildUserPayload(createdUser) : {
                id: userId,
                email: sanitizedEmail,
                name: sanitizedName,
                xp: 0,
                level: 1,
                attention_score: 0,
                badges: [],
                current_streak: 0,
                best_streak: 0,
                mode: 'growth',
            },
            token,
            message: "User created successfully"
        }), { status: 201, headers: jsonHeaders });
    } catch (error) {
        console.error('[Auth] Register error:', error.message);
        let friendlyMessage = 'Unable to create account. Please try again later.';
        if (error.message && error.message.includes('UNIQUE constraint')) {
            friendlyMessage = 'An account with this email already exists. Please log in instead.';
        }
        return new Response(JSON.stringify({ error: friendlyMessage }), { status: 500, headers: jsonHeaders });
    }
}

async function handleGoogleAuth(request, env, corsHeaders) {
    const jsonHeaders = {...corsHeaders, 'Content-Type': 'application/json' };

    try {
        const { credential } = await request.json();
        const db = env.MINDFULFEED_DB;
        const userColumns = await ensureUserSchema(db);

        if (!credential) {
            return new Response(JSON.stringify({ error: 'Google credential is required.' }), {
                status: 400,
                headers: jsonHeaders,
            });
        }

        const googleProfile = await fetchGoogleProfile(credential, env);
        if (!googleProfile.email) {
            return new Response(JSON.stringify({ error: 'Google account did not provide an email address.' }), {
                status: 400,
                headers: jsonHeaders,
            });
        }

        const user = await upsertGoogleUser(db, userColumns, googleProfile);
        const token = crypto.randomUUID();
        await persistUserSession(db, userColumns, user.id, token);

        return new Response(JSON.stringify({
            success: true,
            user: buildUserPayload(user),
            token,
        }), {
            status: 200,
            headers: jsonHeaders,
        });
    } catch (error) {
        console.error('[Auth] Google auth error:', error.message);
        const status = error.message === 'Invalid Google credential.' ||
            error.message === 'Google client ID mismatch.' ||
            error.message === 'Google email is not verified.' ||
            error.message === 'Google account did not provide an email address.' ?
            400 :
            500;

        return new Response(JSON.stringify({ error: status === 400 ? error.message : 'Unable to authenticate with Google right now.' }), {
            status,
            headers: jsonHeaders,
        });
    }
}

/**
 * Handle Demo/Guest Login
 */
async function handleDemoLogin(request, env, corsHeaders) {
    const jsonHeaders = {...corsHeaders, 'Content-Type': 'application/json' };

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