/**
 * CHATR Media Agency — Real Live Video Export & Rendering Engine
 * 
 * Captures live 9:16 Canvas video frames and mixed Web Audio to export
 * an authentic, playable MP4/WebM video file directly in the browser.
 */

export interface VideoClipScene {
  id: string;
  title: string;
  videoUrl: string;
  durationSeconds: number;
  spokenLine: string;
  subtitleText: string;
}

export class RealVideoExportEngine {
  /**
   * Records a live canvas stream and audio destination into a downloadable video blob
   */
  public static async recordCanvasStream(
    canvas: HTMLCanvasElement,
    audioStreamTrack?: MediaStreamTrack,
    durationMs: number = 10000,
    onProgress?: (percent: number) => void
  ): Promise<{ blob: Blob; url: string; filename: string }> {
    const canvasStream = canvas.captureStream(30); // 30 FPS
    
    const combinedTracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];
    if (audioStreamTrack) {
      combinedTracks.push(audioStreamTrack);
    }

    const combinedStream = new MediaStream(combinedTracks);

    // Pick best supported MIME type
    let mimeType = 'video/webm;codecs=vp9,opus';
    if (MediaRecorder.isTypeSupported('video/mp4')) {
      mimeType = 'video/mp4';
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
      mimeType = 'video/webm;codecs=vp8,opus';
    } else if (MediaRecorder.isTypeSupported('video/webm')) {
      mimeType = 'video/webm';
    }

    const mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType,
      videoBitsPerSecond: 4500000 // 4.5 Mbps high fidelity
    });

    const recordedChunks: Blob[] = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const percent = Math.min(100, Math.round((elapsed / durationMs) * 100));
        if (onProgress) onProgress(percent);
      }, 100);

      mediaRecorder.onstop = () => {
        clearInterval(interval);
        const blob = new Blob(recordedChunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const filename = `chatr_live_reel_${Date.now()}.${mimeType.includes('mp4') ? 'mp4' : 'webm'}`;
        resolve({ blob, url, filename });
      };

      mediaRecorder.onerror = (err) => {
        clearInterval(interval);
        reject(err);
      };

      mediaRecorder.start(100); // chunk every 100ms

      setTimeout(() => {
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      }, durationMs);
    });
  }
}
