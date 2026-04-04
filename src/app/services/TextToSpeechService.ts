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

  private slangMap: Record<string, Record<string, string>> = {
    'en': {
      'going to': 'gonna',
      'want to': 'wanna',
      'hello': 'hey there!',
      'yes': 'yeah!',
      'no': 'nah,',
      'good': 'awesome',
      'very': 'really, really',
    }
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
   * Preprocess text for a more native, natural feel
   */
  private preprocessText(text: string, languageCode: string): string {
    let processed = text;
    
    // 1. Add subtle slang if available for the language
    const langSlang = this.slangMap[languageCode];
    if (langSlang) {
      Object.entries(langSlang).forEach(([key, value]) => {
        const regex = new RegExp(`\\b${key}\\b`, 'gi');
        processed = processed.replace(regex, value);
      });
    }

    // 2. Add natural pauses (commas) after certain introductory words
    const fillers = ['Actually', 'Well', 'So', 'Look'];
    fillers.forEach(filler => {
      const regex = new RegExp(`^${filler}\\s`, 'i');
      if (regex.test(processed)) {
        processed = processed.replace(regex, `${filler}, `);
      }
    });

    return processed;
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
      return null;
    }

    const langCode = this.languageCodes[languageCode] || languageCode;
    const preferredNames = this.preferredVoices[languageCode] || [];

    // Strategy 1: Try preferred voice names
    for (const preferredName of preferredNames) {
      const voice = this.voices.find(v => 
        v.name.includes(preferredName) && v.lang.startsWith(langCode.split('-')[0])
      );
      if (voice) return voice;
    }

    // Strategy 2: Try exact language match
    const exactMatch = this.voices.find(v => v.lang === langCode);
    if (exactMatch) return exactMatch;

    // Strategy 3: Try language prefix match
    const langPrefix = langCode.split('-')[0];
    const prefixMatch = this.voices.find(v => v.lang.startsWith(langPrefix));
    if (prefixMatch) return prefixMatch;

    return this.voices.find(v => v.lang.startsWith('en')) || this.voices[0];
  }

  /**
   * Speak text with natural tone and emotion
   */
  public async speak(
    text: string,
    languageCode: string = 'en',
    config: Partial<VoiceConfig> = {}
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech Synthesis not supported'));
        return;
      }

      if (!this.isInitialized) {
        await this.initVoices();
      }

      this.stop();

      const naturalText = this.preprocessText(text, languageCode);
      const utterance = new SpeechSynthesisUtterance(naturalText);
      this.currentUtterance = utterance;

      const voice = this.findBestVoice(languageCode);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = this.languageCodes[languageCode] || 'en-US';
      }

      // Configure parameters for natural speech
      utterance.pitch = config.pitch ?? 1.05;    // Slightly higher for a friendly buddy tone
      utterance.rate = config.rate ?? 0.95;      // Slightly slower for better clarity
      utterance.volume = config.volume ?? 1.0;

      utterance.onend = () => {
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (event) => {
        this.currentUtterance = null;
        if (event.error === 'interrupted' || event.error === 'canceled' || event.error === 'not-allowed') {
          resolve();
        } else {
          reject(new Error(`Speech synthesis error: ${event.error}`));
        }
      };

      try {
        this.synthesis.speak(utterance);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop current speech
   */
  public stop(): void {
    if (this.synthesis && (this.synthesis.speaking || this.synthesis.pending)) {
      this.synthesis.cancel();
      this.currentUtterance = null;
    }
  }

  /**
   * Speak with excitement!
   */
  public async speakExcited(text: string, languageCode: string = 'en'): Promise<void> {
    const excitedText = `Wow! ${text}!`;
    return this.speak(excitedText, languageCode, { pitch: 1.25, rate: 1.1 });
  }

  /**
   * Speak with thoughtful hesitation
   */
  public async speakThinking(text: string, languageCode: string = 'en'): Promise<void> {
    const thinkingText = `Um, let's see... ${text}`;
    return this.speak(thinkingText, languageCode, { pitch: 0.95, rate: 0.85 });
  }

  /**
   * Speak in a casual, conversational way
   */
  public async speakCasual(text: string, languageCode: string = 'en'): Promise<void> {
    return this.speak(text, languageCode, { pitch: 1.0, rate: 1.0 });
  }

  /**
   * Speak text with natural pauses for longer content
   */
  public async speakWithPauses(
    text: string,
    languageCode: string = 'en'
  ): Promise<void> {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    for (const sentence of sentences) {
      if (sentence.trim()) {
        await this.speak(sentence.trim(), languageCode);
        await new Promise(resolve => setTimeout(resolve, 250));
      }
    }
  }
}

// Export singleton instance
export const ttsService = new TextToSpeechService();

// Also export the class for custom instances
export { TextToSpeechService };