export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
}

export interface ChatProvider {
  chat(messages: ChatMessage[]): Promise<string>;
}

export interface EmbeddingProvider {
  embed(text: string): Promise<number[]>;
}

export interface ImageProvider {
  generateImage(prompt: string): Promise<string>; // URL or base64
}

export interface AudioProvider {
  transcribe(audioData: Buffer): Promise<string>;
  synthesize(text: string): Promise<Buffer>;
}

export interface ModerationProvider {
  moderate(text: string): Promise<boolean>;
}
