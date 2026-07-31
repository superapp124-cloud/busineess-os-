// electron/workers/search-worker.cjs
// This file runs in a dedicated Node.js UtilityProcess to keep SQLite FTS and Vector search
// off the main Electron thread, preventing UI freezes when querying thousands of documents.

const { parentPort } = require('electron');

if (parentPort) {
  parentPort.on('message', async (event) => {
    // Standard IPC Request Contract
    const request = event.data;
    const startTs = Date.now();

    try {
      if (request.action === 'ping') {
        return sendResponse(request.id, true, { status: 'ready', type: 'search' }, null, startTs);
      }
      
      // TODO: Move heavy SQLite and LanceDB query logic here later
      throw new Error(`Unknown action: ${request.action}`);

    } catch (err) {
      sendResponse(request.id, false, null, err.message, startTs);
    }
  });
}

function sendResponse(id, success, result, errorMsg, startTs) {
  if (!parentPort || !id) return;
  parentPort.postMessage({
    id, success, result, error: errorMsg,
    metrics: {
      durationMs: Date.now() - startTs,
      memoryMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
    }
  });
}

setInterval(() => {}, 60000);
