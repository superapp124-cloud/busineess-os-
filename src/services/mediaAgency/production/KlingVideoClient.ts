/**
 * CHATR Media Agency — Kling AI Generative Video Client
 * 
 * Directly interfaces with Kling AI (Kuaishou) Text-to-Video & Image-to-Video API
 * to generate photorealistic Indian short-form video reels (9:16 vertical format).
 */

export interface KlingVideoTaskRequest {
  prompt: string;
  negative_prompt?: string;
  aspect_ratio?: '9:16' | '16:9' | '1:1';
  duration?: '5' | '10';
  mode?: 'std' | 'pro';
  model?: 'kling-v1' | 'kling-v1-5' | 'kling-v2';
  cfg_scale?: number;
}

export interface KlingVideoTaskResponse {
  code: number;
  message?: string;
  request_id?: string;
  data?: {
    task_id: string;
    created_at?: number;
    updated_at?: number;
  };
}

export interface KlingTaskStatusResult {
  code: number;
  message?: string;
  data: {
    task_id: string;
    task_status: 'submitted' | 'processing' | 'succeed' | 'failed';
    task_status_msg?: string;
    created_at?: number;
    updated_at?: number;
    task_result?: {
      videos?: Array<{
        id: string;
        url: string;
        duration: string;
      }>;
    };
  };
}

export class KlingVideoClient {
  private static BASE_URL = 'https://api.klingai.com/v1';

  public static getApiKey(): string {
    const envKey = (import.meta as any).env?.VITE_KLING_API_KEY || '';
    const storedKey = localStorage.getItem('chatr_kling_api_key') || '';
    return storedKey || envKey || 'api-key-kling-n-92SN_wTb8IWOz-9GVP1oU0VidjONvz-C1bn-23ftc';
  }

  public static setApiKey(key: string): void {
    localStorage.setItem('chatr_kling_api_key', key.trim());
  }

  /**
   * Creates a Text-to-Video generation task on Kling AI
   */
  public static async submitTextToVideo(
    request: KlingVideoTaskRequest,
    customApiKey?: string
  ): Promise<KlingVideoTaskResponse> {
    const apiKey = customApiKey || this.getApiKey();
    if (!apiKey) {
      throw new Error('Kling API Key is missing. Please provide your API key.');
    }

    const payload = {
      model: request.model || 'kling-v1',
      prompt: request.prompt,
      negative_prompt: request.negative_prompt || 'low quality, blurry, distorted, deformed anatomy, static photo, cartoon, extra limbs',
      cfg_scale: request.cfg_scale || 0.5,
      mode: request.mode || 'std',
      aspect_ratio: request.aspect_ratio || '9:16',
      duration: request.duration || '5'
    };

    const response = await fetch(`${this.BASE_URL}/videos/text2video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-API-Key': apiKey
      },
      body: JSON.stringify(payload)
    });

    const json = await response.json();

    if (!response.ok || json.code !== 0) {
      throw new Error(json.message || `Kling API Error (${json.code || response.status}): Account balance or quota exhausted.`);
    }

    return json;
  }

  /**
   * Polls task status and fetches the rendered MP4 video URL
   */
  public static async queryTaskStatus(
    taskId: string,
    customApiKey?: string
  ): Promise<KlingTaskStatusResult> {
    const apiKey = customApiKey || this.getApiKey();

    const response = await fetch(`${this.BASE_URL}/videos/text2video/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'X-API-Key': apiKey
      }
    });

    const json = await response.json();
    if (!response.ok || json.code !== 0) {
      throw new Error(json.message || `Failed to fetch status (${response.status})`);
    }

    return json;
  }
}
