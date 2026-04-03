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
