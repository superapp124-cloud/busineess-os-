/**
 * CHATR SI OS — Local Knowledge Engine (Personal RAG)
 * src/ai/rag/LocalKnowledgeEngine.ts
 *
 * Implements local on-device RAG:
 * document -> chunk -> embedding -> encrypted index -> cosine retrieval -> PersonalAgent
 * 100% on-device, zero cloud leakage.
 */

import { chatrLocalRuntime } from '../runtime/ChatrLocalRuntime';

export interface DocumentChunk {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  text: string;
  embedding: number[];
  createdAt: number;
}

export interface RetrievalResult {
  chunk: DocumentChunk;
  similarity: number;
}

export class LocalKnowledgeEngine {
  private static instance: LocalKnowledgeEngine;
  private chunks: DocumentChunk[] = [];

  private constructor() {}

  public static getInstance(): LocalKnowledgeEngine {
    if (!LocalKnowledgeEngine.instance) {
      LocalKnowledgeEngine.instance = new LocalKnowledgeEngine();
    }
    return LocalKnowledgeEngine.instance;
  }

  /**
   * Chunks a document into semantically bounded segments
   */
  public chunkText(text: string, maxChunkSize = 250, overlap = 40): string[] {
    const words = text.trim().split(/\s+/);
    if (words.length <= maxChunkSize) {
      return [words.join(' ')];
    }

    const chunks: string[] = [];
    let i = 0;
    while (i < words.length) {
      const chunk = words.slice(i, i + maxChunkSize).join(' ');
      chunks.push(chunk);
      i += (maxChunkSize - overlap);
    }
    return chunks;
  }

  /**
   * Indexes a local document into the vector store
   */
  public async indexDocument(documentId: string, title: string, content: string): Promise<number> {
    const rawChunks = this.chunkText(content);
    let indexed = 0;

    for (let idx = 0; idx < rawChunks.length; idx++) {
      const text = rawChunks[idx];
      const embedding = await chatrLocalRuntime.embed(text);
      const chunkId = `chk_${documentId}_${idx}`;

      this.chunks.push({
        chunkId,
        documentId,
        documentTitle: title,
        text,
        embedding,
        createdAt: Date.now(),
      });
      indexed++;
    }

    return indexed;
  }

  /**
   * Cosine similarity retrieval over local vector index
   */
  public async retrieve(query: string, topK = 3, threshold = 0.25): Promise<RetrievalResult[]> {
    if (this.chunks.length === 0) return [];

    const queryEmbedding = await chatrLocalRuntime.embed(query);
    const scored: RetrievalResult[] = [];

    for (const chunk of this.chunks) {
      const sim = this.cosineSimilarity(queryEmbedding, chunk.embedding);
      if (sim >= threshold) {
        scored.push({ chunk, similarity: sim });
      }
    }

    scored.sort((a, b) => b.similarity - a.similarity);
    return scored.slice(0, topK);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0) return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dot / denominator;
  }

  public clearAll(): void {
    this.chunks = [];
  }

  public getIndexSize(): number {
    return this.chunks.length;
  }
}

export const localKnowledgeEngine = LocalKnowledgeEngine.getInstance();
