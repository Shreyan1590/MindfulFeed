/**
 * Cloudflare Integration Service
 * 
 * Integrates with:
 * - Cloudflare R2 (Object Storage)
 * - Cloudflare D1 (SQLite Database)
 * 
 * Account ID: 340badfe3c0958f9beb19c3cec27fe1f
 * Database ID: 9b0453b7-2cfe-4280-86da-8fa9c72eac34
 */

interface CloudflareConfig {
  accountId: string;
  databaseId: string;
  apiToken?: string;
}

interface UserProgress {
  userId: string;
  totalPoints: number;
  badges: string[];
  quizProgress: Record<string, number>;
  lastActive: string;
  createdAt: string;
}

interface ArticleData {
  id: string;
  title: string;
  content: string;
  category: string;
  imageUrl?: string;
  createdAt: string;
}

class CloudflareService {
  private config: CloudflareConfig;
  private apiBaseUrl: string;
  private r2BaseUrl: string;

  constructor() {
    this.config = {
      accountId: '340badfe3c0958f9beb19c3cec27fe1f',
      databaseId: '9b0453b7-2cfe-4280-86da-8fa9c72eac34',
      apiToken: import.meta.env.VITE_CLOUDFLARE_API_TOKEN || '',
    };

    this.apiBaseUrl = `https://api.cloudflare.com/client/v4/accounts/${this.config.accountId}`;
    this.r2BaseUrl = `https://${this.config.accountId}.r2.cloudflarestorage.com`;
  }

  /**
   * Get headers for Cloudflare API requests
   */
  private getHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.config.apiToken}`,
      'Content-Type': 'application/json',
    };
  }

  // ==========================================
  // D1 DATABASE OPERATIONS
  // ==========================================

  /**
   * Initialize database tables
   */
  async initializeDatabase(): Promise<void> {
    console.log('🗄️ Initializing Cloudflare D1 Database...');

    const queries = [
      // User Progress Table
      `CREATE TABLE IF NOT EXISTS user_progress (
        user_id TEXT PRIMARY KEY,
        total_points INTEGER DEFAULT 0,
        badges TEXT DEFAULT '[]',
        quiz_progress TEXT DEFAULT '{}',
        last_active TEXT,
        created_at TEXT
      )`,

      // Articles Table
      `CREATE TABLE IF NOT EXISTS articles (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT,
        image_url TEXT,
        created_at TEXT
      )`,

      // User Activity Log
      `CREATE TABLE IF NOT EXISTS activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        activity_type TEXT,
        activity_data TEXT,
        timestamp TEXT
      )`,

      // Chat History
      `CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        article_id TEXT,
        message TEXT,
        role TEXT,
        timestamp TEXT
      )`,
    ];

    try {
      for (const query of queries) {
        await this.executeD1Query(query);
      }
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Execute D1 SQL query
   */
  private async executeD1Query(sql: string, params: any[] = []): Promise<any> {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/d1/database/${this.config.databaseId}/query`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            sql,
            params,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`D1 Query failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('D1 Query Error:', error);
      throw error;
    }
  }

  /**
   * Save user progress to D1
   */
  async saveUserProgress(userId: string, progress: Partial<UserProgress>): Promise<void> {
    console.log('💾 Saving user progress to D1...');

    const sql = `
      INSERT INTO user_progress (user_id, total_points, badges, quiz_progress, last_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        total_points = ?,
        badges = ?,
        quiz_progress = ?,
        last_active = ?
    `;

    const now = new Date().toISOString();
    const params = [
      userId,
      progress.totalPoints || 0,
      JSON.stringify(progress.badges || []),
      JSON.stringify(progress.quizProgress || {}),
      now,
      progress.createdAt || now,
      // Update values
      progress.totalPoints || 0,
      JSON.stringify(progress.badges || []),
      JSON.stringify(progress.quizProgress || {}),
      now,
    ];

    await this.executeD1Query(sql, params);
    console.log('✅ User progress saved');
  }

  /**
   * Get user progress from D1
   */
  async getUserProgress(userId: string): Promise<UserProgress | null> {
    console.log('📖 Loading user progress from D1...');

    const sql = `SELECT * FROM user_progress WHERE user_id = ?`;
    const result = await this.executeD1Query(sql, [userId]);

    if (result && result.length > 0) {
      const row = result[0];
      return {
        userId: row.user_id,
        totalPoints: row.total_points,
        badges: JSON.parse(row.badges),
        quizProgress: JSON.parse(row.quiz_progress),
        lastActive: row.last_active,
        createdAt: row.created_at,
      };
    }

    return null;
  }

  /**
   * Save article to D1
   */
  async saveArticle(article: ArticleData): Promise<void> {
    console.log('📝 Saving article to D1...');

    const sql = `
      INSERT INTO articles (id, title, content, category, image_url, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = ?,
        content = ?,
        category = ?,
        image_url = ?
    `;

    const params = [
      article.id,
      article.title,
      article.content,
      article.category,
      article.imageUrl || null,
      article.createdAt,
      // Update values
      article.title,
      article.content,
      article.category,
      article.imageUrl || null,
    ];

    await this.executeD1Query(sql, params);
    console.log('✅ Article saved');
  }

  /**
   * Get all articles from D1
   */
  async getArticles(): Promise<ArticleData[]> {
    console.log('📚 Loading articles from D1...');

    const sql = `SELECT * FROM articles ORDER BY created_at DESC`;
    const result = await this.executeD1Query(sql);

    return result.map((row: any) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      category: row.category,
      imageUrl: row.image_url,
      createdAt: row.created_at,
    }));
  }

  /**
   * Log user activity
   */
  async logActivity(userId: string, activityType: string, activityData: any): Promise<void> {
    const sql = `
      INSERT INTO activity_log (user_id, activity_type, activity_data, timestamp)
      VALUES (?, ?, ?, ?)
    `;

    const params = [
      userId,
      activityType,
      JSON.stringify(activityData),
      new Date().toISOString(),
    ];

    await this.executeD1Query(sql, params);
  }

  /**
   * Save chat message
   */
  async saveChatMessage(
    userId: string,
    articleId: string,
    message: string,
    role: 'user' | 'bot'
  ): Promise<void> {
    const sql = `
      INSERT INTO chat_history (user_id, article_id, message, role, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `;

    const params = [userId, articleId, message, role, new Date().toISOString()];

    await this.executeD1Query(sql, params);
  }

  /**
   * Get chat history for an article
   */
  async getChatHistory(userId: string, articleId: string): Promise<any[]> {
    const sql = `
      SELECT * FROM chat_history 
      WHERE user_id = ? AND article_id = ?
      ORDER BY timestamp ASC
    `;

    const result = await this.executeD1Query(sql, [userId, articleId]);
    return result;
  }

  // ==========================================
  // R2 OBJECT STORAGE OPERATIONS
  // ==========================================

  /**
   * Upload file to Cloudflare R2
   */
  async uploadToR2(
    bucketName: string,
    fileName: string,
    file: File | Blob,
    contentType?: string
  ): Promise<string> {
    console.log(`📤 Uploading ${fileName} to R2 bucket: ${bucketName}...`);

    try {
      // For R2, we need to use presigned URLs or Workers
      // This is a simplified example - in production, you'd use a Worker
      const formData = new FormData();
      formData.append('file', file);

      // Note: This requires a Cloudflare Worker endpoint
      const workerUrl = `https://upload.${this.config.accountId}.workers.dev/r2/${bucketName}/${fileName}`;

      const response = await fetch(workerUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.config.apiToken}`,
          'Content-Type': contentType || file.type,
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error(`R2 Upload failed: ${response.status}`);
      }

      const publicUrl = `https://${bucketName}.${this.config.accountId}.r2.dev/${fileName}`;
      console.log('✅ File uploaded to R2:', publicUrl);

      return publicUrl;
    } catch (error) {
      console.error('❌ R2 Upload Error:', error);
      throw error;
    }
  }

  /**
   * Upload image to R2
   */
  async uploadImage(file: File, folder: string = 'images'): Promise<string> {
    const fileName = `${folder}/${Date.now()}-${file.name}`;
    return this.uploadToR2('mindfulfeed-assets', fileName, file, file.type);
  }

  /**
   * Upload user avatar to R2
   */
  async uploadAvatar(userId: string, file: File): Promise<string> {
    const fileName = `avatars/${userId}-${Date.now()}.${file.name.split('.').pop()}`;
    return this.uploadToR2('mindfulfeed-assets', fileName, file, file.type);
  }

  /**
   * Delete file from R2
   */
  async deleteFromR2(bucketName: string, fileName: string): Promise<void> {
    console.log(`🗑️ Deleting ${fileName} from R2...`);

    try {
      const workerUrl = `https://upload.${this.config.accountId}.workers.dev/r2/${bucketName}/${fileName}`;

      const response = await fetch(workerUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.config.apiToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`R2 Delete failed: ${response.status}`);
      }

      console.log('✅ File deleted from R2');
    } catch (error) {
      console.error('❌ R2 Delete Error:', error);
      throw error;
    }
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  /**
   * Check if Cloudflare API is configured
   */
  isConfigured(): boolean {
    return !!this.config.apiToken;
  }

  /**
   * Get Cloudflare account info
   */
  async getAccountInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.apiBaseUrl}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to get account info');
      }

      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Account Info Error:', error);
      return null;
    }
  }

  /**
   * Test database connection
   */
  async testDatabaseConnection(): Promise<boolean> {
    try {
      const result = await this.executeD1Query('SELECT 1 as test');
      return result && result[0]?.test === 1;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const cloudflareService = new CloudflareService();

// Also export the class
export { CloudflareService };
