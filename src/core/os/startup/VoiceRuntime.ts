export interface VoiceOptions {
  pitch?: number;
  rate?: number;
}

export interface VoiceProvider {
  speak(text: string, options?: VoiceOptions, onStart?: () => void, onEnd?: () => void): void;
  stop(): void;
}

export class WebSpeechProvider implements VoiceProvider {
  private synthesis?: SpeechSynthesis;
  private voice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
      this.synthesis = window.speechSynthesis;
      // Load voices
      const loadVoices = () => {
        try {
          const voices = this.synthesis?.getVoices() || [];
          this.voice = voices.find(v => v.lang.startsWith('en')) || voices[0] || null;
        } catch {
          // ignore voice load errors
        }
      };
      loadVoices();
      if (this.synthesis) {
        this.synthesis.onvoiceschanged = loadVoices;
      }
    }
  }

  speak(text: string, options?: VoiceOptions, onStart?: () => void, onEnd?: () => void): void {
    if (!this.synthesis || typeof SpeechSynthesisUtterance === 'undefined') {
      if (onStart) onStart();
      if (onEnd) onEnd();
      return;
    }
    this.stop();
    const utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) {
      utterance.voice = this.voice;
    }
    utterance.pitch = options?.pitch ?? 1.0;
    utterance.rate = options?.rate ?? 1.0;
    
    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;

    try {
      this.synthesis.speak(utterance);
    } catch {
      if (onEnd) onEnd();
    }
  }

  stop(): void {
    try {
      this.synthesis?.cancel();
    } catch {
      // ignore
    }
  }
}

export const voiceRuntime = new WebSpeechProvider();
