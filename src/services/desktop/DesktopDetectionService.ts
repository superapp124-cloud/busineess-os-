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
      const timeout = setTimeout(() => controller.abort(), 1000);

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
      // Endpoint unreachable — Desktop App is not currently running on this machine
    }

    return { isDesktopRunning: false };
  }

  /**
   * Safely launch desktop app via custom deep link protocol (chatr://open)
   * Only called when loopback health check confirms app or user explicitly clicks open.
   */
  static launchDesktopApp(path: string = 'open') {
    try {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = `chatr://${path}`;
      document.body.appendChild(iframe);
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
    } catch {
      // Ignore protocol launcher exceptions on unregistered machines
    }
  }
}
