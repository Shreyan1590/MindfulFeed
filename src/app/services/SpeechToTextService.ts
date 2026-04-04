/**
 * Speech-to-Text Service using Web Speech API
 * 
 * Provides real-time voice transcription with support for multiple languages.
 */

export interface STTResult {
  text: string;
  isFinal: boolean;
  confidence: number;
}

export type STTStatus = 'idle' | 'listening' | 'processing' | 'error';

class SpeechToTextService {
  private recognition: any = null;
  private status: STTStatus = 'idle';
  private onResultCallback: ((result: STTResult) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private onStatusChangeCallback: ((status: STTStatus) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.setupListeners();
      } else {
        console.warn('Speech Recognition API not supported in this browser');
      }
    }
  }

  private setupListeners() {
    if (!this.recognition) return;

    this.recognition.continuous = false;
    this.recognition.interimResults = true;

    this.recognition.onstart = () => {
      this.updateStatus('listening');
    };

    this.recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const text = event.results[last][0].transcript;
      const isFinal = event.results[last].isFinal;
      const confidence = event.results[last][0].confidence;

      if (this.onResultCallback) {
        this.onResultCallback({ text, isFinal, confidence });
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('STT Error:', event.error);
      this.updateStatus('error');
      if (this.onErrorCallback) {
        this.onErrorCallback(event.error);
      }
    };

    this.recognition.onend = () => {
      if (this.status !== 'error') {
        this.updateStatus('idle');
      }
    };
  }

  private updateStatus(newStatus: STTStatus) {
    this.status = newStatus;
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback(newStatus);
    }
  }

  /**
   * Start listening for voice input
   */
  public start(languageCode: string = 'en-US'): void {
    if (!this.recognition) {
      if (this.onErrorCallback) this.onErrorCallback('Speech Recognition not supported');
      return;
    }

    try {
      this.recognition.lang = languageCode;
      this.recognition.start();
    } catch (error) {
      console.error('Failed to start STT:', error);
      this.updateStatus('error');
    }
  }

  /**
   * Stop listening
   */
  public stop(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  /**
   * Register callbacks
   */
  public onResult(callback: (result: STTResult) => void) {
    this.onResultCallback = callback;
  }

  public onError(callback: (error: string) => void) {
    this.onErrorCallback = callback;
  }

  public onStatusChange(callback: (status: STTStatus) => void) {
    this.onStatusChangeCallback = callback;
  }

  public getStatus(): STTStatus {
    return this.status;
  }

  /**
   * Check if STT is supported
   */
  public isSupported(): boolean {
    return !!this.recognition;
  }
}

export const sttService = new SpeechToTextService();
