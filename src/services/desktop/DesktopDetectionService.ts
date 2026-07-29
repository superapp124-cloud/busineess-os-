/**
 * CHATR Desktop Detection Service
 * 
 * Runs in browser (chatrchat.in) to probe if CHATR Desktop Runtime is active
 * on 127.0.0.1:3717 via CORS-friendly loopback health endpoint.
 */

export interface DesktopHealthResponse {
  isDesktopRunning: boolean;
  runtimeVersion?: string;
  provider?: string;
  readyModels?: string[];
}

const LOOPBACK_HEALTH_URL = 'http://127.0.0.1:3717/health';

export class DesktopDetectionService {
  /**
   * Check if CHATR Desktop Runtime is running locally on 127.0.0.1:3717
   */
  static async checkDesktopStatus(): Promise<DesktopHealthResponse> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1500);

      const res = await fetch(LOOPBACK_HEALTH_URL, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        return {
          isDesktopRunning: true,
          runtimeVersion: data.version,
          provider: data.provider,
          readyModels: data.readyModels || []
        };
      }
    } catch {
      // Endpoint unreachable — Desktop App is not currently running
    }

    return { isDesktopRunning: false };
  }

  /**
   * Launch desktop app via custom deep link protocol (chatr://open)
   */
  static launchDesktopApp(path: string = 'open') {
    window.location.href = `chatr://${path}`;
  }
}
