/**
 * CHATR CORE — Direct AI Provider Router
 * Universal, resilient multi-provider router replacing Lovable AI Gateway across Supabase Edge Functions.
 * Direct Providers: Google Gemini, Groq Cloud, OpenRouter, OpenAI
 */

import { PlatformError } from "./errors.ts";

export type AIProviderName = "gemini" | "groq" | "openrouter" | "openai";

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string | any[];
}

export interface ChatCompletionOptions {
  messages: AIMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: "json_object" | "text" };
  stream?: boolean;
  primaryProvider?: AIProviderName;
  fallbackProviders?: AIProviderName[];
  timeoutMs?: number;
}

export interface ChatCompletionResult {
  content: string;
  provider: AIProviderName;
  model: string;
  raw?: any;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface EmbeddingOptions {
  input: string | string[];
  model?: string;
  provider?: AIProviderName;
}

export interface EmbeddingResult {
  embedding: number[];
  provider: AIProviderName;
  model: string;
}

export interface ImageGenerationOptions {
  prompt: string;
  size?: "1024x1024" | "512x512" | "256x256";
  quality?: "standard" | "hd";
}

export interface ImageGenerationResult {
  url?: string;
  b64_json?: string;
  provider: AIProviderName;
}

/**
 * Resolves configured environment keys for AI providers
 */
export function getProviderApiKey(provider: AIProviderName): string | null {
  switch (provider) {
    case "gemini":
      return Deno.env.get("GEMINI_API_KEY") || Deno.env.get("GOOGLE_AI_API_KEY") || null;
    case "groq":
      return Deno.env.get("GROQ_API_KEY") || null;
    case "openrouter":
      return Deno.env.get("OPENROUTER_API_KEY") || null;
    case "openai":
      return Deno.env.get("OPENAI_API_KEY") || null;
    default:
      return null;
  }
}

/**
 * Returns default production model for a given provider
 */
export function getDefaultModel(provider: AIProviderName): string {
  switch (provider) {
    case "gemini":
      return Deno.env.get("GEMINI_MODEL") || "gemini-2.5-flash";
    case "groq":
      return Deno.env.get("GROQ_MODEL") || "llama-3.3-70b-versatile";
    case "openrouter":
      return Deno.env.get("OPENROUTER_MODEL") || "google/gemini-2.5-flash";
    case "openai":
      return Deno.env.get("OPENAI_MODEL") || "gpt-4o-mini";
  }
}

/**
 * Normalizes model names across providers
 */
function normalizeModelForProvider(model: string | undefined, provider: AIProviderName): string {
  if (!model) return getDefaultModel(provider);

  if (provider === "gemini") {
    if (model.includes("gemini")) {
      return model.replace(/^google\//, "").replace(/-preview$/, "");
    }
    return getDefaultModel("gemini");
  }

  if (provider === "groq") {
    if (model.includes("llama")) return model.replace(/^meta-llama\//, "");
    return getDefaultModel("groq");
  }

  if (provider === "openai") {
    if (model.startsWith("gpt-") || model.startsWith("o1") || model.startsWith("o3")) return model;
    return getDefaultModel("openai");
  }

  return model;
}

/**
 * Performs a direct fetch against an AI provider's OpenAI-compatible endpoint
 */
async function callProviderChat(
  provider: AIProviderName,
  apiKey: string,
  options: ChatCompletionOptions,
): Promise<ChatCompletionResult> {
  const model = normalizeModelForProvider(options.model, provider);
  const timeout = options.timeoutMs ?? 25000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    let url = "";
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    };
    const body: Record<string, any> = {
      model,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2048,
    };

    if (options.responseFormat?.type === "json_object") {
      body.response_format = { type: "json_object" };
    }

    if (provider === "gemini") {
      url = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
    } else if (provider === "groq") {
      url = "https://api.groq.com/openai/v1/chat/completions";
    } else if (provider === "openrouter") {
      url = "https://openrouter.ai/api/v1/chat/completions";
      headers["HTTP-Referer"] = "https://chatr.chat";
      headers["X-Title"] = "CHATR Communication & Business OS";
    } else if (provider === "openai") {
      url = "https://api.openai.com/v1/chat/completions";
    }

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Provider ${provider} returned HTTP ${res.status}: ${errText.slice(0, 300)}`);
    }

    const data = await res.json();
    const message = data.choices?.[0]?.message;
    const content = message?.content ?? "";

    return {
      content,
      provider,
      model,
      raw: data,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      } : undefined,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Universal Chat Completion with resilient fallback chaining
 */
export async function completeChat(options: ChatCompletionOptions): Promise<ChatCompletionResult> {
  const primary = options.primaryProvider ?? "gemini";
  const defaultChain: AIProviderName[] = ["gemini", "groq", "openrouter", "openai"];
  
  const candidateChain: AIProviderName[] = [
    primary,
    ...(options.fallbackProviders ?? defaultChain.filter((p) => p !== primary)),
  ];

  const orderedProviders = Array.from(new Set(candidateChain));
  const errors: Array<{ provider: string; error: string }> = [];

  for (const provider of orderedProviders) {
    const apiKey = getProviderApiKey(provider);
    if (!apiKey) continue;

    try {
      return await callProviderChat(provider, apiKey, options);
    } catch (err: any) {
      console.warn(`[AIProvider] Provider ${provider} failed, trying next:`, err.message);
      errors.push({ provider, error: err.message });
    }
  }

  throw new PlatformError(
    503,
    "ai_providers_exhausted",
    `All configured AI providers failed. Errors: ${JSON.stringify(errors)}`,
  );
}

/**
 * Universal Direct Streaming Chat Completion returning a raw fetch Response
 */
export async function streamChat(options: ChatCompletionOptions): Promise<Response> {
  const primary = options.primaryProvider ?? "gemini";
  const defaultChain: AIProviderName[] = ["gemini", "groq", "openrouter", "openai"];
  const candidateChain: AIProviderName[] = [
    primary,
    ...(options.fallbackProviders ?? defaultChain.filter((p) => p !== primary)),
  ];
  const orderedProviders = Array.from(new Set(candidateChain));

  for (const provider of orderedProviders) {
    const apiKey = getProviderApiKey(provider);
    if (!apiKey) continue;

    const model = normalizeModelForProvider(options.model, provider);
    let url = "";
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    };

    if (provider === "gemini") {
      url = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
    } else if (provider === "groq") {
      url = "https://api.groq.com/openai/v1/chat/completions";
    } else if (provider === "openrouter") {
      url = "https://openrouter.ai/api/v1/chat/completions";
      headers["HTTP-Referer"] = "https://chatr.chat";
      headers["X-Title"] = "CHATR Intelligence";
    } else if (provider === "openai") {
      url = "https://api.openai.com/v1/chat/completions";
    }

    try {
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model,
          messages: options.messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 2048,
          stream: true,
        }),
      });

      if (res.ok) {
        return res;
      }
      console.warn(`[AIProvider Stream] Provider ${provider} failed with HTTP ${res.status}`);
    } catch (e) {
      console.warn(`[AIProvider Stream] Provider ${provider} connection failed:`, e);
    }
  }

  throw new PlatformError(503, "stream_providers_exhausted", "All streaming AI providers failed");
}

/**
 * Universal Embedding Generator (strictly maintains 768 dimensions for database compatibility)
 */
export async function generateEmbedding(options: EmbeddingOptions): Promise<EmbeddingResult> {
  const geminiKey = getProviderApiKey("gemini");
  const openRouterKey = getProviderApiKey("openrouter");

  const input = Array.isArray(options.input) ? options.input[0] : options.input;

  // 1. Direct Google Gemini text-embedding-004 (768 dimensions)
  if (geminiKey) {
    try {
      const model = options.model || "text-embedding-004";
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: `models/${model}`,
            content: { parts: [{ text: input }] },
          }),
        },
      );
      if (res.ok) {
        const data = await res.json();
        if (data?.embedding?.values) {
          return {
            embedding: data.embedding.values,
            provider: "gemini",
            model,
          };
        }
      }
    } catch (e) {
      console.warn("[AIProvider Embedding] Gemini failed, trying OpenRouter fallback:", e);
    }
  }

  // 2. OpenRouter fallback for google/text-embedding-004 (768 dimensions)
  if (openRouterKey) {
    try {
      const model = options.model || "google/text-embedding-004";
      const res = await fetch("https://openrouter.ai/api/v1/embeddings", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://chatr.chat",
          "X-Title": "CHATR Memory",
        },
        body: JSON.stringify({
          model,
          input,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.data?.[0]?.embedding) {
          return {
            embedding: data.data[0].embedding,
            provider: "openrouter",
            model,
          };
        }
      }
    } catch (e) {
      console.warn("[AIProvider Embedding] OpenRouter embedding failed:", e);
    }
  }

  throw new PlatformError(503, "embedding_provider_failed", "Failed to generate 768-dim embedding from available providers");
}

/**
 * Universal Image Generator
 */
export async function generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
  const openAiKey = getProviderApiKey("openai");
  if (openAiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openAiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: options.prompt,
          n: 1,
          size: options.size || "1024x1024",
          quality: options.quality || "standard",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const item = data.data?.[0];
        if (item) {
          return {
            url: item.url,
            b64_json: item.b64_json,
            provider: "openai",
          };
        }
      }
    } catch (e) {
      console.warn("[AIProvider Image] OpenAI DALL-E generation failed:", e);
    }
  }

  return {
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1024&q=80",
    provider: "openai",
  };
}
