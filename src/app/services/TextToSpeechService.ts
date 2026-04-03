/**
 * Real Text-to-Speech Service using Web Speech API
 * 
 * Provides natural voice output in multiple languages
 * Similar to Google Gemini's speech capabilities
 */

interface VoiceConfig {
  languageCode: string;
  voiceName?: string;
  pitch: number;
  rate: number;
  volume: number;
}

class TextToSpeechService {
  private synthesis: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isInitialized = false;
  
  // Language to BCP-47 language code mapping
  private languageCodes: Record<string, string> = {
    'en': 'en-US',      // English (US)
    'ta': 'ta-IN',      // Tamil (India)
    'hi': 'hi-IN',      // Hindi (India)
    'ml': 'ml-IN',      // Malayalam (India)
    'gu': 'gu-IN',      // Gujarati (India)
  };

  // Preferred voice names for each language (fallback to any matching language)
  private preferredVoices: Record<string, string[]> = {
    'en': ['Google US English', 'Microsoft Zira', 'Samantha', 'Daniel', 'Karen'],
    'ta': ['Google தமிழ்', 'Microsoft Tamil', 'Tamil India'],
    'hi': ['Google हिन्दी', 'Microsoft Hindi', 'Lekha', 'Hemant'],
    'ml': ['Google മലയാളം', 'Microsoft Malayalam'],
    'gu': ['Google ગુજરાતી', 'Microsoft Gujarati'],
  };

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.initVoices();
    } else {
      console.warn('Text-to-Speech not supported in this browser');
      this.synthesis = null as any;
    }
  }

  /**
   * Initialize and load available voices
   */
  private async initVoices(): Promise<void> {
    return new Promise((resolve) => {
      // Load voices
      const loadVoices = () => {
        this.voices = this.synthesis.getVoices();
        
        if (this.voices.length > 0) {
          this.isInitialized = true;
          console.log('🎤 TTS Initialized with', this.voices.length, 'voices');
          console.log('📢 Available languages:', 
            [...new Set(this.voices.map(v => v.lang))].sort().join(', ')
          );
          resolve();
        }
      };

      // Chrome requires waiting for voices to load
      if (this.synthesis.getVoices().length === 0) {
        this.synthesis.addEventListener('voiceschanged', loadVoices);
      } else {
        loadVoices();
      }

      // Fallback timeout
      setTimeout(() => {
        if (!this.isInitialized) {
          loadVoices();
        }
      }, 1000);
    });
  }

  /**
   * Find the best voice for a given language
   */
  private findBestVoice(languageCode: string): SpeechSynthesisVoice | null {
    if (!this.voices || this.voices.length === 0) {
      console.warn('No voices available');
      return null;
    }

    const langCode = this.languageCodes[languageCode] || languageCode;
    const preferredNames = this.preferredVoices[languageCode] || [];

    console.log(`🔍 Finding voice for ${languageCode} (${langCode})`);

    // Strategy 1: Try preferred voice names
    for (const preferredName of preferredNames) {
      const voice = this.voices.find(v => 
        v.name.includes(preferredName) && v.lang.startsWith(langCode.split('-')[0])
      );
      if (voice) {
        console.log('✅ Found preferred voice:', voice.name, voice.lang);
        return voice;
      }
    }

    // Strategy 2: Try exact language match (e.g., 'ta-IN')
    const exactMatch = this.voices.find(v => v.lang === langCode);
    if (exactMatch) {
      console.log('✅ Found exact match:', exactMatch.name, exactMatch.lang);
      return exactMatch;
    }

    // Strategy 3: Try language prefix match (e.g., 'ta')
    const langPrefix = langCode.split('-')[0];
    const prefixMatch = this.voices.find(v => v.lang.startsWith(langPrefix));
    if (prefixMatch) {
      console.log('✅ Found prefix match:', prefixMatch.name, prefixMatch.lang);
      return prefixMatch;
    }

    // Strategy 4: For Indian languages, try any Indian voice
    if (langCode.includes('-IN')) {
      const indianVoice = this.voices.find(v => v.lang.includes('-IN'));
      if (indianVoice) {
        console.log('✅ Found Indian voice:', indianVoice.name, indianVoice.lang);
        return indianVoice;
      }
    }

    // Strategy 5: Fallback to default English
    console.warn('⚠️ No native voice found, falling back to English');
    return this.voices.find(v => v.lang.startsWith('en')) || this.voices[0];
  }

  /**
   * Speak text in the specified language
   */
  public async speak(
    text: string,
    languageCode: string = 'en',
    config: Partial<VoiceConfig> = {}
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (!this.synthesis) {
        console.error('❌ Speech Synthesis not available');
        reject(new Error('Speech Synthesis not supported'));
        return;
      }

      // Wait for voices to load if not ready
      if (!this.isInitialized) {
        await this.initVoices();
      }

      // Stop any current speech
      this.stop();

      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      // Find best voice for language
      const voice = this.findBestVoice(languageCode);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = this.languageCodes[languageCode] || 'en-US';
      }

      // Configure voice parameters for natural speech
      utterance.pitch = config.pitch ?? 1.0;     // 0.0 to 2.0
      utterance.rate = config.rate ?? 0.9;       // 0.1 to 10 (0.9 = slightly slower, more clear)
      utterance.volume = config.volume ?? 1.0;   // 0.0 to 1.0

      // Event handlers
      utterance.onstart = () => {
        console.log('🎤 Speaking:', text.substring(0, 50) + '...');
        console.log('🗣️ Voice:', utterance.voice?.name || 'default');
        console.log('🌍 Language:', utterance.lang);
      };

      utterance.onend = () => {
        console.log('✅ Finished speaking');
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (event) => {
        this.currentUtterance = null;
        
        // Don't reject on interruption or cancellation - these are normal
        if (event.error === 'interrupted' || event.error === 'canceled') {
          console.log('ℹ️ Speech interrupted (normal when starting new speech)');
          resolve();
        } else if (event.error === 'not-allowed') {
          // Browser blocked autoplay - this is normal, just log silently
          console.log('ℹ️ Speech not allowed (requires user interaction first)');
          resolve();
        } else {
          // Only log actual errors
          console.error('❌ Speech error:', event.error, event);
          reject(new Error(`Speech synthesis error: ${event.error}`));
        }
      };

      // Speak!
      try {
        this.synthesis.speak(utterance);
      } catch (error) {
        console.error('❌ Failed to speak:', error);
        reject(error);
      }
    });
  }

  /**
   * Stop current speech
   */
  public stop(): void {
    if (this.synthesis && this.synthesis.speaking) {
      this.synthesis.cancel();
      this.currentUtterance = null;
      // Don't log every stop - causes console spam
    }
  }

  /**
   * Pause current speech
   */
  public pause(): void {
    if (this.synthesis && this.synthesis.speaking) {
      this.synthesis.pause();
      console.log('⏸️ Speech paused');
    }
  }

  /**
   * Resume paused speech
   */
  public resume(): void {
    if (this.synthesis && this.synthesis.paused) {
      this.synthesis.resume();
      console.log('▶️ Speech resumed');
    }
  }

  /**
   * Check if currently speaking
   */
  public isSpeaking(): boolean {
    return this.synthesis ? this.synthesis.speaking : false;
  }

  /**
   * Check if paused
   */
  public isPaused(): boolean {
    return this.synthesis ? this.synthesis.paused : false;
  }

  /**
   * Get available voices for a language
   */
  public getVoicesForLanguage(languageCode: string): SpeechSynthesisVoice[] {
    const langCode = this.languageCodes[languageCode] || languageCode;
    const langPrefix = langCode.split('-')[0];
    
    return this.voices.filter(v => 
      v.lang === langCode || v.lang.startsWith(langPrefix)
    );
  }

  /**
   * Get all available voices
   */
  public getAllVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  /**
   * Speak text with natural pauses (for longer content)
   */
  public async speakWithPauses(
    text: string,
    languageCode: string = 'en',
    config: Partial<VoiceConfig> = {}
  ): Promise<void> {
    // Split by sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    for (const sentence of sentences) {
      if (sentence.trim()) {
        await this.speak(sentence.trim(), languageCode, config);
        // Small pause between sentences
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
  }

  /**
   * Speak text character by character (for emphasis)
   */
  public async speakSlowly(
    text: string,
    languageCode: string = 'en'
  ): Promise<void> {
    return this.speak(text, languageCode, { rate: 0.6, pitch: 1.1 });
  }

  /**
   * Speak text with excitement
   */
  public async speakExcited(
    text: string,
    languageCode: string = 'en'
  ): Promise<void> {
    return this.speak(text, languageCode, { rate: 1.1, pitch: 1.3 });
  }

  /**
   * Speak text calmly
   */
  public async speakCalmly(
    text: string,
    languageCode: string = 'en'
  ): Promise<void> {
    return this.speak(text, languageCode, { rate: 0.85, pitch: 0.9 });
  }
}

// Export singleton instance
export const ttsService = new TextToSpeechService();

// Also export the class for custom instances
export { TextToSpeechService };