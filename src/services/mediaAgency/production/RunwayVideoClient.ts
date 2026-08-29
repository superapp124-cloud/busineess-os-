/**
 * CHATR Media Agency — RunwayML Gen-4.5 / Gen-4 Turbo Video Client
 * 
 * Verified API client for RunwayML API (v2024-09-13)
 */

export interface RunwayTaskRequest {
  promptText: string;
  model?: 'gen4.5' | 'gen4_turbo';
  duration?: 5 | 10;
  ratio?: '720:1280' | '1280:720';
}

export interface RunwayTaskResponse {
  id: string;
  status: 'PENDING' | 'THROTTLED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
  createdAt?: string;
  output?: string[];
  failure?: string;
  error?: string;
}

export class RunwayVideoClient {
  private static BASE_URL = 'https://api.dev.runwayml.com/v1';

  public static getApiKey(): string {
    const envKey = (import.meta as any).env?.VITE_RUNWAY_API_KEY || '';
    const storedKey = localStorage.getItem('chatr_runway_api_key') || '';
    return storedKey || envKey || 'key_0762357e0b3659c2a2ac0cb93e11f2d912bb33a44369109d95b056b9ce62e46ea89630ef420cb7cdd63ebad85922ac9147c5b67f37fcf695702fb016edaa4af8';
  }

  public static setApiKey(key: string): void {
    localStorage.setItem('chatr_runway_api_key', key.trim());
  }

  /**
   * Submits a live Text-to-Video generation task to Runway Gen-4.5
   */
  public static async createVideoTask(
    request: RunwayTaskRequest,
    customApiKey?: string
  ): Promise<RunwayTaskResponse> {
    const apiKey = customApiKey || this.getApiKey();
    if (!apiKey) {
      throw new Error('Runway API Key is missing.');
    }

    const payload = {
      promptText: request.promptText,
      model: request.model || 'gen4.5',
      duration: request.duration || 5,
      ratio: request.ratio || '720:1280'
    };

    const response = await fetch(`${this.BASE_URL}/text_to_video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-Runway-Version': '2024-09-13'
      },
      body: JSON.stringify(payload)
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.error || `Runway API Error (${response.status}): ${JSON.stringify(json)}`);
    }

    return json;
  }

  /**
   * Queries task status and returns the rendered MP4 output URL
   */
  public static async getTaskStatus(
    taskId: string,
    customApiKey?: string
  ): Promise<RunwayTaskResponse> {
    const apiKey = customApiKey || this.getApiKey();

    const response = await fetch(`${this.BASE_URL}/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'X-Runway-Version': '2024-09-13'
      }
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || `Failed to fetch status (${response.status})`);
    }

    return await response.json();
  }
}
