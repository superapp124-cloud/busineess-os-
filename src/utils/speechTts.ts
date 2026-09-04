/**
 * CHATR-Meera Voice & Speech Engine
 * Web Speech API Text-to-Speech (TTS), Speech-to-Text (STT), and Live Audio Analyser.
 * Zero cloud dependencies — runs 100% locally in browser.
 */

export type VoiceState = 'IDLE' | 'LISTENING' | 'THINKING' | 'RESPONDING' | 'EXECUTING' | 'WARNING' | 'ERROR';

class MeeraSpeechEngine {
  private synth: SpeechSynthesis | null = null;
  private isSpeaking = false;
  private voiceState: VoiceState = 'IDLE';
  private stateListeners: Set<(state: VoiceState) => void> = new Set();
  private speakingListeners: Set<(speaking: boolean) => void> = new Set();
  private audioAnalyser: AnalyserNode | null = null;
  private micMediaStream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  private micDataArray: Uint8Array<ArrayBuffer> | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public isTtsAvailable(): boolean {
    return Boolean(this.synth);
  }

  public isSttAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public onVoiceStateChange(cb: (state: VoiceState) => void): () => void {
    this.stateListeners.add(cb);
    return () => this.stateListeners.delete(cb);
  }

  public onSpeakingChange(cb: (speaking: boolean) => void): () => void {
    this.speakingListeners.add(cb);
    return () => this.speakingListeners.delete(cb);
  }

  public setVoiceState(state: VoiceState) {
    this.voiceState = state;
    this.stateListeners.forEach((cb) => cb(state));
  }

  public getVoiceState(): VoiceState {
    return this.voiceState;
  }

  /**
   * Initializes real microphone analyser node for authentic audio visualizer.
   */
  public async startMicStream(): Promise<boolean> {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return false;
    }
    try {
      if (!this.audioCtx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.audioCtx = new AudioCtx();
      }
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      this.micMediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const source = this.audioCtx.createMediaStreamSource(this.micMediaStream);
      this.audioAnalyser = this.audioCtx.createAnalyser();
      this.audioAnalyser.fftSize = 64;
      this.micDataArray = new Uint8Array(this.audioAnalyser.frequencyBinCount);
      source.connect(this.audioAnalyser);
      return true;
    } catch {
      return false;
    }
  }

  public stopMicStream(): void {
    if (this.micMediaStream) {
      this.micMediaStream.getTracks().forEach((track) => track.stop());
      this.micMediaStream = null;
    }
  }

  /**
   * Returns current real microphone frequency spectrum amplitude for visualizer (0.0 - 1.0).
   */
  public getMicAmplitude(): number[] {
    if (!this.audioAnalyser || !this.micDataArray) {
      return [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1];
    }
    this.audioAnalyser.getByteFrequencyData(this.micDataArray);
    const bars: number[] = [];
    const step = Math.floor(this.micDataArray.length / 8);
    for (let i = 0; i < 8; i++) {
      const val = this.micDataArray[i * step] / 255.0;
      bars.push(Math.max(0.08, val));
    }
    return bars;
  }

  /**
   * Speaks text aloud using natural local Web Speech API synthesis in given language.
   */
  public speak(text: string, lang = 'hi-IN'): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        resolve();
        return;
      }

      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 1.0;
      utterance.pitch = 1.15; // Natural feminine pitch for Meera

      // Match best natural voice for Indian locales
      const voices = this.synth.getVoices();
      const preferred = voices.find(
        (v) =>
          (v.lang.toLowerCase().includes(lang.toLowerCase().slice(0, 2)) ||
            v.lang.toLowerCase().includes('in') ||
            v.name.toLowerCase().includes('india') ||
            v.name.toLowerCase().includes('hindi')) &&
          !v.name.toLowerCase().includes('male')
      ) || voices[0];

      if (preferred) {
        utterance.voice = preferred;
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.setVoiceState('RESPONDING');
        this.speakingListeners.forEach((cb) => cb(true));
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.setVoiceState('IDLE');
        this.speakingListeners.forEach((cb) => cb(false));
        resolve();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        this.setVoiceState('IDLE');
        this.speakingListeners.forEach((cb) => cb(false));
        resolve();
      };

      this.synth.speak(utterance);
    });
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.setVoiceState('IDLE');
      this.speakingListeners.forEach((cb) => cb(false));
    }
  }
}

export const meeraVoice = new MeeraSpeechEngine();
