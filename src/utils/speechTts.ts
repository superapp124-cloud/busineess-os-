/**
 * CHATR-Meera Voice & Speech Engine
 * Provides Web Speech API Text-to-Speech (TTS) and Speech-to-Text (STT) for Meera.
 * Supports multilingual Indian accents (Hindi, Indian English, etc.).
 */

class MeeraSpeechEngine {
  private synth: SpeechSynthesis | null = null;
  private isSpeaking = false;
  private listeners: Set<(speaking: boolean) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public onSpeakingChange(cb: (speaking: boolean) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify(speaking: boolean) {
    this.isSpeaking = speaking;
    this.listeners.forEach((cb) => cb(speaking));
  }

  public speak(text: string, lang = 'hi-IN'): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        console.warn('SpeechSynthesis not available');
        resolve();
        return;
      }

      this.synth.cancel(); // Cancel any ongoing speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.1; // Friendly natural feminine pitch for Meera

      // Find best available Hindi / Indian English voice
      const voices = this.synth.getVoices();
      const preferredVoice = voices.find(
        (v) =>
          (v.lang.includes('hi') || v.lang.includes('IN') || v.name.toLowerCase().includes('india') || v.name.toLowerCase().includes('female')) &&
          !v.name.toLowerCase().includes('male')
      ) || voices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => this.notify(true);
      utterance.onend = () => {
        this.notify(false);
        resolve();
      };
      utterance.onerror = () => {
        this.notify(false);
        resolve();
      };

      this.synth.speak(utterance);
    });
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.notify(false);
    }
  }
}

export const meeraVoice = new MeeraSpeechEngine();
