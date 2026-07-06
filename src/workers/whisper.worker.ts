import { pipeline, env } from '@huggingface/transformers';

console.log('[Whisper Worker] Worker script loaded and initializing...');

// Configure transformers for offline bundled usage
env.allowLocalModels = true;
env.allowRemoteModels = false;
// Use self.location.href to dynamically resolve the path so Vite doesn't intercept it
const modelDir = '../../models/';
env.localModelPath = new URL(modelDir, self.location.href).href;
env.useBrowserCache = false;
env.backends.onnx.wasm.wasmPaths = new URL('/wasm/', self.location.href).href;

console.log('[Whisper Worker] Env config:', { 
    localModelPath: env.localModelPath, 
    allowLocalModels: env.allowLocalModels, 
    allowRemoteModels: env.allowRemoteModels 
});

class PipelineSingleton {
    static task = 'automatic-speech-recognition';
    static model = 'Xenova/whisper-tiny.en';
    static instancePromise: Promise<any> | null = null;
    static failed: boolean = false;

    static async getInstance(progress_callback: any) {
        if (this.failed) {
            throw new Error('Pipeline creation previously failed. Not retrying to avoid spam.');
        }
        if (this.instancePromise === null) {
            console.log(`[Whisper Worker] Starting model pipeline creation for ${this.model}...`);
            this.instancePromise = pipeline(this.task as any, this.model, { progress_callback })
                .then((instance: any) => {
                    console.log(`[Whisper Worker] Model pipeline created successfully.`);
                    return instance;
                })
                .catch((err: any) => {
                    this.failed = true;
                    console.error('[Whisper Worker] FATAL ERROR creating pipeline:', err);
                    throw err;
                });
        }
        return this.instancePromise;
    }
}

self.addEventListener('message', async (event) => {
    const { type, audioData } = event.data;

    if (type === 'transcribe') {
        console.log(`[Whisper Worker] Received transcribe command with ${audioData?.length} audio samples`);
        try {
            let transcriber = await PipelineSingleton.getInstance((x: any) => {
                console.log('[Whisper Worker] Model download progress:', x);
                self.postMessage({ type: 'progress', data: x });
            });

            console.log('[Whisper Worker] Running transcription on audio chunk...');
            const result = await transcriber(audioData, {
                chunk_length_s: 30,
                stride_length_s: 5,
                return_timestamps: false
            });

            console.log('[Whisper Worker] Transcription result:', result.text);
            self.postMessage({
                type: 'result',
                text: result.text
            });
        } catch (error: any) {
            console.error('[Whisper Worker] Error during transcription flow:', error);
            self.postMessage({
                type: 'error',
                error: error.message || error.toString()
            });
        }
    }
});
