/**
 * CHATR Document Provider Plugin Interfaces
 */

import { IProviderPlugin } from '../../kernel/registry/ProviderRegistry';

export interface DocumentInput {
  documentId: string;
  filePath: string;
  mimeType: string;
  options?: {
    extractTables?: boolean;
    extractFormulas?: boolean;
    generateEmbeddings?: boolean;
  };
}

export interface DocumentOutput {
  documentId: string;
  totalPages: number;
  markdown: string;
  structuredData: Record<string, unknown>;
  parseDurationMs: number;
}

export type IDocumentProviderPlugin = IProviderPlugin<DocumentInput, DocumentOutput>;
