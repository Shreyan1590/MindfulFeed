import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-36d0365b/health", (c) => {
  return c.json({ status: "ok" });
});

// ======================
// USER MANAGEMENT
// ======================

// Create or update user profile
app.post("/make-server-36d0365b/users", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, email, fullName } = body;

    if (!userId || !email || !fullName) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const user = {
      userId,
      email,
      fullName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        totalPosts: 0,
        approvedPosts: 0,
        rejectedPosts: 0,
        averageScore: 0,
        trustScore: 100,
      },
    };

    await kv.set(`user:${userId}`, user);
    console.log(`✅ User profile created: ${fullName} (${userId})`);

    return c.json({ success: true, user });
  } catch (error) {
    console.error("❌ Error creating user:", error);
    return c.json({ error: "Failed to create user" }, 500);
  }
});

// Get user profile
app.get("/make-server-36d0365b/users/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const user = await kv.get(`user:${userId}`);

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({ success: true, user });
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    return c.json({ error: "Failed to fetch user" }, 500);
  }
});

// Update user stats
app.put("/make-server-36d0365b/users/:userId/stats", async (c) => {
  try {
    const userId = c.req.param("userId");
    const body = await c.req.json();
    
    const user = await kv.get(`user:${userId}`);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    user.stats = { ...user.stats, ...body };
    user.updatedAt = new Date().toISOString();
    
    await kv.set(`user:${userId}`, user);
    
    return c.json({ success: true, user });
  } catch (error) {
    console.error("❌ Error updating user stats:", error);
    return c.json({ error: "Failed to update user stats" }, 500);
  }
});

// ======================
// CONTENT MODERATION
// ======================

// Moderate content before posting
app.post("/make-server-36d0365b/moderate", async (c) => {
  try {
    const body = await c.req.json();
    const { content, title, imageUrl, userId } = body;

    if (!content) {
      return c.json({ error: "Content is required" }, 400);
    }

    console.log(`🛡️ Moderating content from user: ${userId || 'anonymous'}`);

    // Perform AI moderation
    const moderationResult = await moderateContent(content, title, imageUrl);

    // Log moderation result
    const logEntry = {
      userId: userId || 'anonymous',
      content: content.substring(0, 100) + '...',
      title,
      result: moderationResult,
      timestamp: new Date().toISOString(),
    };

    // Store moderation log
    const logKey = `moderation:${Date.now()}:${userId || 'anon'}`;
    await kv.set(logKey, logEntry);

    console.log(
      moderationResult.approved
        ? `✅ Content APPROVED - Score: ${moderationResult.score}`
        : `❌ Content REJECTED - Reason: ${moderationResult.reason}`
    );

    return c.json({ success: true, moderation: moderationResult });
  } catch (error) {
    console.error("❌ Error moderating content:", error);
    return c.json({ error: "Failed to moderate content" }, 500);
  }
});

// ======================
// POST MANAGEMENT
// ======================

// Create post (only if moderation passed)
app.post("/make-server-36d0365b/posts", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, title, content, imageUrl, moderationResult } = body;

    if (!userId || !content) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Verify moderation passed
    if (!moderationResult || !moderationResult.approved) {
      return c.json({ error: "Content must be moderated and approved first" }, 403);
    }

    // Get user info
    const user = await kv.get(`user:${userId}`);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    const postId = `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const post = {
      postId,
      userId,
      userName: user.fullName,
      title,
      content,
      imageUrl,
      moderationScore: moderationResult.score,
      moderationFlags: moderationResult.flags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
      views: 0,
      status: 'published',
    };

    // Save post
    await kv.set(`post:${postId}`, post);
    
    // Add to user's posts
    await kv.set(`user:${userId}:post:${postId}`, postId);

    // Update user stats
    user.stats.totalPosts++;
    user.stats.approvedPosts++;
    user.stats.averageScore = 
      (user.stats.averageScore * (user.stats.totalPosts - 1) + moderationResult.score) / 
      user.stats.totalPosts;
    user.updatedAt = new Date().toISOString();
    await kv.set(`user:${userId}`, user);

    console.log(`✅ Post created: ${postId} by ${user.fullName}`);

    return c.json({ success: true, post });
  } catch (error) {
    console.error("❌ Error creating post:", error);
    return c.json({ error: "Failed to create post" }, 500);
  }
});

// Get all posts (feed)
app.get("/make-server-36d0365b/posts", async (c) => {
  try {
    // Get all posts using prefix
    const allPosts = await kv.getByPrefix("post:");
    
    // Filter out user-specific post references
    const posts = allPosts
      .filter((p: any) => p.key.startsWith("post:post-"))
      .map((p: any) => p.value)
      .sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    return c.json({ success: true, posts, count: posts.length });
  } catch (error) {
    console.error("❌ Error fetching posts:", error);
    return c.json({ error: "Failed to fetch posts" }, 500);
  }
});

// Get single post
app.get("/make-server-36d0365b/posts/:postId", async (c) => {
  try {
    const postId = c.req.param("postId");
    const post = await kv.get(`post:${postId}`);

    if (!post) {
      return c.json({ error: "Post not found" }, 404);
    }

    // Increment views
    post.views = (post.views || 0) + 1;
    await kv.set(`post:${postId}`, post);

    return c.json({ success: true, post });
  } catch (error) {
    console.error("❌ Error fetching post:", error);
    return c.json({ error: "Failed to fetch post" }, 500);
  }
});

// Get user's posts
app.get("/make-server-36d0365b/users/:userId/posts", async (c) => {
  try {
    const userId = c.req.param("userId");
    
    // Get all user's post IDs
    const userPostRefs = await kv.getByPrefix(`user:${userId}:post:`);
    
    // Fetch full post data
    const posts = await Promise.all(
      userPostRefs.map(async (ref: any) => {
        const postId = ref.value;
        return await kv.get(`post:${postId}`);
      })
    );

    const validPosts = posts.filter(p => p !== null)
      .sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    return c.json({ success: true, posts: validPosts, count: validPosts.length });
  } catch (error) {
    console.error("❌ Error fetching user posts:", error);
    return c.json({ error: "Failed to fetch user posts" }, 500);
  }
});

// Like post
app.post("/make-server-36d0365b/posts/:postId/like", async (c) => {
  try {
    const postId = c.req.param("postId");
    const post = await kv.get(`post:${postId}`);

    if (!post) {
      return c.json({ error: "Post not found" }, 404);
    }

    post.likes = (post.likes || 0) + 1;
    post.updatedAt = new Date().toISOString();
    await kv.set(`post:${postId}`, post);

    return c.json({ success: true, likes: post.likes });
  } catch (error) {
    console.error("❌ Error liking post:", error);
    return c.json({ error: "Failed to like post" }, 500);
  }
});

// Delete post
app.delete("/make-server-36d0365b/posts/:postId", async (c) => {
  try {
    const postId = c.req.param("postId");
    const post = await kv.get(`post:${postId}`);

    if (!post) {
      return c.json({ error: "Post not found" }, 404);
    }

    // Delete post
    await kv.del(`post:${postId}`);
    
    // Delete user reference
    await kv.del(`user:${post.userId}:post:${postId}`);

    console.log(`🗑️ Post deleted: ${postId}`);

    return c.json({ success: true });
  } catch (error) {
    console.error("❌ Error deleting post:", error);
    return c.json({ error: "Failed to delete post" }, 500);
  }
});

// ======================
// MODERATION FUNCTIONS
// ======================

async function moderateContent(
  content: string,
  title?: string,
  imageUrl?: string
): Promise<any> {
  const fullText = `${title || ''} ${content}`.toLowerCase();

  // Harmful keywords
  const hateSpeech = detectHateSpeech(fullText);
  const violence = detectViolence(fullText);
  const explicit = detectExplicit(fullText);
  const spam = detectSpam(fullText);
  const misinformation = detectMisinformation(fullText);
  const lowQuality = detectLowQuality(content);

  const flags = {
    hateSpeech,
    violence,
    explicit,
    spam,
    misinformation,
    lowQuality,
  };

  const toxicity = calculateToxicity(flags);
  const usefulness = calculateUsefulness(fullText, content);
  const score = calculateFinalScore(toxicity, usefulness, flags);
  const approval = determineApproval(score, flags, toxicity, usefulness);

  return {
    ...approval,
    score,
    flags,
    timestamp: new Date().toISOString(),
  };
}

function detectHateSpeech(text: string): boolean {
  const indicators = ['hate', 'racist', 'sexist', 'discrimination', 'bigot'];
  return indicators.some(word => text.includes(word));
}

function detectViolence(text: string): boolean {
  const indicators = ['kill', 'murder', 'harm', 'attack', 'weapon', 'violence'];
  return indicators.filter(word => text.includes(word)).length >= 2;
}

function detectExplicit(text: string): boolean {
  const indicators = ['nsfw', 'explicit', '18+', 'xxx'];
  return indicators.some(word => text.includes(word));
}

function detectSpam(text: string): boolean {
  const indicators = ['click here', 'buy now', 'limited time', 'guaranteed'];
  const linkCount = (text.match(/https?:\/\//g) || []).length;
  return indicators.some(word => text.includes(word)) || linkCount > 3;
}

function detectMisinformation(text: string): boolean {
  const indicators = ['fake news', 'conspiracy', 'hoax', 'coverup'];
  return indicators.some(word => text.includes(word));
}

function detectLowQuality(content: string): boolean {
  if (content.length < 20) return true;
  const meaningfulChars = content.replace(/[^a-zA-Z]/g, '');
  return meaningfulChars.length < 10;
}

function calculateToxicity(flags: any): number {
  let toxicity = 0;
  if (flags.hateSpeech) toxicity += 40;
  if (flags.violence) toxicity += 35;
  if (flags.explicit) toxicity += 30;
  if (flags.spam) toxicity += 25;
  if (flags.misinformation) toxicity += 20;
  if (flags.lowQuality) toxicity += 10;
  return Math.min(100, toxicity);
}

function calculateUsefulness(text: string, content: string): number {
  let score = 50;
  
  const usefulKeywords = ['helpful', 'informative', 'guide', 'tutorial', 'tips'];
  const usefulMatches = usefulKeywords.filter(k => text.includes(k)).length;
  score += usefulMatches * 5;
  
  const wordCount = content.split(/\s+/).length;
  if (wordCount >= 50 && wordCount <= 500) score += 15;
  else if (wordCount >= 20 && wordCount < 50) score += 10;
  
  return Math.max(0, Math.min(100, score));
}

function calculateFinalScore(toxicity: number, usefulness: number, flags: any): number {
  let score = usefulness - toxicity;
  if (flags.hateSpeech || flags.violence || flags.explicit) {
    score = Math.min(score, 20);
  }
  return Math.max(0, Math.min(100, score));
}

function determineApproval(score: number, flags: any, toxicity: number, usefulness: number): any {
  const suggestions: string[] = [];

  if (flags.hateSpeech) {
    return {
      approved: false,
      category: 'rejected',
      reason: 'Content contains hate speech or discriminatory language',
      suggestions: ['Please revise to be respectful and inclusive'],
    };
  }

  if (flags.violence) {
    return {
      approved: false,
      category: 'rejected',
      reason: 'Content contains violent or threatening language',
      suggestions: ['Please remove violent content'],
    };
  }

  if (flags.explicit) {
    return {
      approved: false,
      category: 'rejected',
      reason: 'Content contains explicit material',
      suggestions: ['Please keep content appropriate for all audiences'],
    };
  }

  if (flags.spam) suggestions.push('Reduce promotional language and excessive links');
  if (flags.misinformation) suggestions.push('Verify facts and provide credible sources');
  if (flags.lowQuality) suggestions.push('Add more detail and substance to your content');

  if (score >= 60) {
    return {
      approved: true,
      category: 'approved',
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    };
  } else if (score >= 40) {
    return {
      approved: false,
      category: 'review',
      reason: 'Content needs improvement for better quality',
      suggestions,
    };
  } else {
    return {
      approved: false,
      category: 'rejected',
      reason: 'Content does not meet quality standards',
      suggestions,
    };
  }
}

Deno.serve(app.fetch);
