// electron/workers/search-worker.cjs
// This file runs in a dedicated Node.js UtilityProcess to keep SQLite FTS and Vector search
// off the main Electron thread, preventing UI freezes when querying thousands of documents.

const { parentPort } = require('electron');

// Basic IPC handling
if (parentPort) {
  parentPort.on('message', async (event) => {
    const { type, payload, id } = event.data;

    try {
      if (type === 'search:ping') {
        parentPort.postMessage({ id, type: 'search:pong', payload: { status: 'ready', ts: Date.now() } });
      }
      
      // TODO: Move heavy SQLite and LanceDB query logic here later
      // Currently acts as a skeleton to establish the multi-process architecture

    } catch (err) {
      parentPort.postMessage({ 
        id, 
        type: 'search:error', 
        payload: { error: err.message } 
      });
    }
  });
}

// Keep process alive but lightweight
setInterval(() => {}, 60000);
