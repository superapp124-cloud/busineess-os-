// electron/workers/sync-worker.cjs
// This file runs in a dedicated Node.js UtilityProcess to keep Supabase realtime subscriptions
// off the main Electron thread, preventing UI freezes during high message volume.

const { parentPort } = require('electron');

// Basic IPC handling
if (parentPort) {
  parentPort.on('message', async (event) => {
    const { type, payload, id } = event.data;

    try {
      if (type === 'sync:ping') {
        parentPort.postMessage({ id, type: 'sync:pong', payload: { status: 'ready', ts: Date.now() } });
      }
      
      // TODO: Move background Supabase sync logic here later
      // Currently acts as a skeleton to establish the multi-process architecture

    } catch (err) {
      parentPort.postMessage({ 
        id, 
        type: 'sync:error', 
        payload: { error: err.message } 
      });
    }
  });
}

// Keep process alive but lightweight
setInterval(() => {}, 60000);
