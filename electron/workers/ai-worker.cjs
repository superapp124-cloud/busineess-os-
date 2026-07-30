// electron/workers/ai-worker.cjs
// This file runs in a dedicated Node.js UtilityProcess to keep AI inference (Ollama/Gemini)
// off the main Electron thread, preventing UI freezes during heavy processing.

const { parentPort } = require('electron');

// Basic IPC handling
if (parentPort) {
  parentPort.on('message', async (event) => {
    const { type, payload, id } = event.data;

    try {
      if (type === 'ai:ping') {
        parentPort.postMessage({ id, type: 'ai:pong', payload: { status: 'ready', ts: Date.now() } });
      }
      
      // TODO: Move heavy Ollama streaming logic here later
      // Currently acts as a skeleton to establish the multi-process architecture

    } catch (err) {
      parentPort.postMessage({ 
        id, 
        type: 'ai:error', 
        payload: { error: err.message } 
      });
    }
  });
}

// Keep process alive but lightweight
setInterval(() => {}, 60000);
