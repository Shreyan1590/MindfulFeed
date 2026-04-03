/**
 * AI Content Moderation Service
 * Analyzes content for harmful material and ensures only useful content is posted
 * 
 * Features:
 * - Hate speech detection
 * - Violence detection
 * - Explicit content detection
 * - Spam detection
 * - Misinformation detection
 * - Quality assessment
 * - Usefulness scoring
 */

export interface ModerationResult {
  approved: boolean;
  score: number; // 0-100, higher is better
  category: 'approved' | 'rejected' | 'review';
  reason?: string;
  flags: {
    hateSpeech: boolean;
    violence: boolean;
    explicit: boolean;
    spam: boolean;
    misinformation: boolean;
    lowQuality: boolean;
  };
  suggestions?: string[];
  timestamp: string;
}

export interface ContentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  toxicity: number; // 0-100
  usefulness: number; // 0-100
  readability: number; // 0-100
  engagement: number; // 0-100 predicted engagement
  topics: string[];
  keywords: string[];
}

class ContentModerationService {
  private readonly HARMFUL_KEYWORDS = [
    // Hate speech
    'hate', 'racist', 'discrimination', 'offensive slur',
    // Violence
    'kill', 'harm', 'attack', 'weapon', 'violence',
    // Explicit
    'explicit content marker',
    // Spam indicators
    'click here', 'buy now', 'limited time', 'act now', 'guaranteed',
  ];

  private readonly USEFUL_KEYWORDS = [
    'helpful', 'informative', 'educational', 'guide', 'tutorial',
    'tips', 'advice', 'learn', 'discover', 'understand',
    'research', 'study', 'insight', 'analysis', 'practical',
  ];

  /**
   * Main moderation function - analyzes content and decides if it should be posted
   */
  async moderateContent(
    content: string,
    title?: string,
    imageUrl?: string,
    userId?: string
  ): Promise<ModerationResult> {
    console.log('🛡️ AI Content Moderation: Analyzing content...');

    // Combine title and content for analysis
    const fullText = `${title || ''} ${content}`.toLowerCase();

    // Run all moderation checks
    const flags = {
      hateSpeech: this.detectHateSpeech(fullText),
      violence: this.detectViolence(fullText),
      explicit: this.detectExplicit(fullText),
      spam: this.detectSpam(fullText),
      misinformation: this.detectMisinformation(fullText),
      lowQuality: this.detectLowQuality(fullText, content),
    };

    // Calculate overall toxicity
    const toxicity = this.calculateToxicity(flags);

    // Calculate usefulness score
    const usefulness = this.calculateUsefulness(fullText, content);

    // Calculate final score (0-100)
    const score = this.calculateFinalScore(toxicity, usefulness, flags);

    // Determine approval status
    const { approved, category, reason, suggestions } = this.determineApproval(
      score,
      flags,
      toxicity,
      usefulness
    );

    const result: ModerationResult = {
      approved,
      score,
      category,
      reason,
      flags,
      suggestions,
      timestamp: new Date().toISOString(),
    };

    // Log result
    if (approved) {
      console.log('✅ Content APPROVED - Score:', score);
    } else {
      console.log('❌ Content REJECTED - Reason:', reason);
    }

    return result;
  }

  /**
   * Analyze content deeply for insights
   */
  async analyzeContent(content: string): Promise<ContentAnalysis> {
    const sentiment = this.analyzeSentiment(content);
    const toxicity = this.calculateToxicity({
      hateSpeech: this.detectHateSpeech(content),
      violence: this.detectViolence(content),
      explicit: this.detectExplicit(content),
      spam: this.detectSpam(content),
      misinformation: this.detectMisinformation(content),
      lowQuality: this.detectLowQuality(content, content),
    });
    const usefulness = this.calculateUsefulness(content, content);
    const readability = this.calculateReadability(content);
    const engagement = this.predictEngagement(content, sentiment, usefulness);
    const topics = this.extractTopics(content);
    const keywords = this.extractKeywords(content);

    return {
      sentiment,
      toxicity,
      usefulness,
      readability,
      engagement,
      topics,
      keywords,
    };
  }

  // ======================
  // Detection Methods
  // ======================

  private detectHateSpeech(text: string): boolean {
    const hateSpeechIndicators = [
      'hate', 'racist', 'sexist', 'discrimination', 'bigot',
      'inferior', 'supremacy', 'slur', 'offensive',
    ];
    return this.containsKeywords(text, hateSpeechIndicators, 1);
  }

  private detectViolence(text: string): boolean {
    const violenceIndicators = [
      'kill', 'murder', 'harm', 'attack', 'assault',
      'weapon', 'gun', 'bomb', 'violence', 'hurt',
      'destroy', 'threat',
    ];
    return this.containsKeywords(text, violenceIndicators, 2);
  }

  private detectExplicit(text: string): boolean {
    const explicitIndicators = [
      'nsfw', 'explicit', 'adult content', '18+', 'xxx',
    ];
    return this.containsKeywords(text, explicitIndicators, 1);
  }

  private detectSpam(text: string): boolean {
    const spamIndicators = [
      'click here', 'buy now', 'limited time', 'act now',
      'guaranteed', 'free money', 'earn $$$', 'mlm',
      'winner', 'congratulations you won', 'claim now',
    ];
    
    // Check for excessive links
    const linkCount = (text.match(/https?:\/\//g) || []).length;
    const hasExcessiveLinks = linkCount > 3;
    
    // Check for excessive caps
    const capsCount = (text.match(/[A-Z]/g) || []).length;
    const totalChars = text.replace(/\s/g, '').length;
    const capsPercentage = totalChars > 0 ? (capsCount / totalChars) * 100 : 0;
    const hasExcessiveCaps = capsPercentage > 50 && text.length > 20;
    
    return (
      this.containsKeywords(text, spamIndicators, 1) ||
      hasExcessiveLinks ||
      hasExcessiveCaps
    );
  }

  private detectMisinformation(text: string): boolean {
    const misinformationIndicators = [
      'fake news', 'conspiracy', 'hoax', 'unverified',
      'they don\'t want you to know', 'mainstream media lies',
      'wake up', 'sheeple', 'coverup',
    ];
    return this.containsKeywords(text, misinformationIndicators, 1);
  }

  private detectLowQuality(text: string, originalContent: string): boolean {
    // Too short
    if (originalContent.length < 20) return true;
    
    // Only special characters or numbers
    const meaningfulChars = originalContent.replace(/[^a-zA-Z]/g, '');
    if (meaningfulChars.length < 10) return true;
    
    // Repetitive content
    const words = text.split(/\s+/);
    const uniqueWords = new Set(words);
    const repetitiveRatio = words.length / uniqueWords.size;
    if (repetitiveRatio > 3 && words.length > 10) return true;
    
    return false;
  }

  // ======================
  // Calculation Methods
  // ======================

  private calculateToxicity(flags: ModerationResult['flags']): number {
    let toxicity = 0;
    if (flags.hateSpeech) toxicity += 40;
    if (flags.violence) toxicity += 35;
    if (flags.explicit) toxicity += 30;
    if (flags.spam) toxicity += 25;
    if (flags.misinformation) toxicity += 20;
    if (flags.lowQuality) toxicity += 10;
    return Math.min(100, toxicity);
  }

  private calculateUsefulness(text: string, content: string): number {
    let score = 50; // Start at middle
    
    // Check for useful keywords
    const usefulMatches = this.USEFUL_KEYWORDS.filter(keyword =>
      text.includes(keyword)
    ).length;
    score += usefulMatches * 5;
    
    // Length bonus (but not too long)
    const wordCount = content.split(/\s+/).length;
    if (wordCount >= 50 && wordCount <= 500) score += 15;
    else if (wordCount >= 20 && wordCount < 50) score += 10;
    else if (wordCount > 500) score -= 5;
    
    // Structure bonus (has paragraphs)
    const paragraphs = content.split('\n\n').filter(p => p.trim()).length;
    if (paragraphs >= 2) score += 10;
    
    // Question marks (educational content often asks questions)
    const questionCount = (content.match(/\?/g) || []).length;
    if (questionCount > 0 && questionCount <= 3) score += 5;
    
    return Math.max(0, Math.min(100, score));
  }

  private calculateFinalScore(
    toxicity: number,
    usefulness: number,
    flags: ModerationResult['flags']
  ): number {
    // Start with usefulness
    let score = usefulness;
    
    // Subtract toxicity
    score -= toxicity;
    
    // Critical flags get instant low score
    if (flags.hateSpeech || flags.violence || flags.explicit) {
      score = Math.min(score, 20);
    }
    
    return Math.max(0, Math.min(100, score));
  }

  private determineApproval(
    score: number,
    flags: ModerationResult['flags'],
    toxicity: number,
    usefulness: number
  ): {
    approved: boolean;
    category: 'approved' | 'rejected' | 'review';
    reason?: string;
    suggestions?: string[];
  } {
    const suggestions: string[] = [];
    
    // Critical flags - instant rejection
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
    
    // Warning flags
    if (flags.spam) {
      suggestions.push('Reduce promotional language and excessive links');
    }
    
    if (flags.misinformation) {
      suggestions.push('Verify facts and provide credible sources');
    }
    
    if (flags.lowQuality) {
      suggestions.push('Add more detail and substance to your content');
    }
    
    // Score-based decision
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

  // ======================
  // Analysis Methods
  // ======================

  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = [
      'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
      'love', 'enjoy', 'happy', 'beautiful', 'awesome', 'perfect',
      'best', 'brilliant', 'outstanding', 'superb',
    ];
    
    const negativeWords = [
      'bad', 'terrible', 'awful', 'horrible', 'worst', 'hate',
      'sad', 'angry', 'disappointed', 'poor', 'disgusting',
      'useless', 'waste', 'fail', 'pathetic',
    ];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(w => lowerText.includes(w)).length;
    const negativeCount = negativeWords.filter(w => lowerText.includes(w)).length;
    
    if (positiveCount > negativeCount + 1) return 'positive';
    if (negativeCount > positiveCount + 1) return 'negative';
    return 'neutral';
  }

  private calculateReadability(text: string): number {
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    const avgWordsPerSentence = words / Math.max(1, sentences);
    
    // Ideal: 15-20 words per sentence
    if (avgWordsPerSentence >= 15 && avgWordsPerSentence <= 20) return 90;
    if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 25) return 75;
    if (avgWordsPerSentence >= 8 && avgWordsPerSentence <= 30) return 60;
    return 50;
  }

  private predictEngagement(
    content: string,
    sentiment: string,
    usefulness: number
  ): number {
    let engagement = 50;
    
    // Positive sentiment tends to engage more
    if (sentiment === 'positive') engagement += 15;
    if (sentiment === 'negative') engagement += 5; // Controversy also engages
    
    // Usefulness correlates with engagement
    engagement += usefulness * 0.3;
    
    // Questions engage
    const questionCount = (content.match(/\?/g) || []).length;
    engagement += Math.min(15, questionCount * 5);
    
    return Math.max(0, Math.min(100, engagement));
  }

  private extractTopics(text: string): string[] {
    const topicKeywords = {
      technology: ['tech', 'digital', 'software', 'app', 'computer', 'ai', 'code'],
      health: ['health', 'fitness', 'wellness', 'medical', 'diet', 'exercise'],
      business: ['business', 'startup', 'entrepreneur', 'marketing', 'sales'],
      education: ['learn', 'education', 'study', 'course', 'tutorial', 'teach'],
      lifestyle: ['lifestyle', 'travel', 'food', 'fashion', 'home', 'design'],
      news: ['news', 'politics', 'world', 'current', 'events', 'update'],
    };
    
    const lowerText = text.toLowerCase();
    const detectedTopics: string[] = [];
    
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        detectedTopics.push(topic);
      }
    }
    
    return detectedTopics.length > 0 ? detectedTopics : ['general'];
  }

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction
    const words = text.toLowerCase().split(/\s+/);
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to',
      'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are',
      'be', 'this', 'that', 'it', 'will', 'can', 'have', 'has',
    ]);
    
    const meaningfulWords = words.filter(
      word => word.length > 3 && !stopWords.has(word)
    );
    
    // Count frequency
    const frequency: Record<string, number> = {};
    meaningfulWords.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    // Get top 5 keywords
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  // ======================
  // Helper Methods
  // ======================

  private containsKeywords(
    text: string,
    keywords: string[],
    threshold: number = 1
  ): boolean {
    const count = keywords.filter(keyword => text.includes(keyword)).length;
    return count >= threshold;
  }

  /**
   * Get moderation statistics for a user
   */
  async getUserModerationStats(userId: string): Promise<{
    totalPosts: number;
    approvedPosts: number;
    rejectedPosts: number;
    averageScore: number;
    trustScore: number;
  }> {
    // This would normally fetch from database
    // For now, return mock data
    return {
      totalPosts: 0,
      approvedPosts: 0,
      rejectedPosts: 0,
      averageScore: 0,
      trustScore: 100,
    };
  }
}

// Export singleton instance
export const contentModerationService = new ContentModerationService();

// Export class for testing
export default ContentModerationService;
