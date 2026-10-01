/**
 * CHATR SI OS — Model Registry Types
 * src/ai/models/types.ts
 */

export interface ModelDefinition {
  modelId: string;
  name: string;
  version: string;
  runtime: 'llama.cpp' | 'aicore' | 'litert' | 'cloud';
  format: 'GGUF' | 'TASK' | 'TFLITE' | 'API';
  quantization: string;
  sizeBytes: number;
  ramRequirementBytes: number;
  contextLength: number;
  capabilities: string[];
  languages: string[];
  toolCalling: boolean;
  vision: boolean;
  audio: boolean;
  minimumAndroid: number;
  minimumRAMBytes: number;
  accelerators: string[];
  sha256: string;
  signature?: string;
  downloadUrl?: string;
  isDefault?: boolean;
}

export type TaskComplexity = 'SIMPLE_COMMAND' | 'CONVERSATION' | 'COMPLEX_REASONING' | 'HEALTH_EXPLANATION' | 'CRITICAL_SAFETY';
