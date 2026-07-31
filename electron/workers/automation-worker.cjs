// electron/workers/automation-worker.cjs
// This file runs in a dedicated Node.js UtilityProcess to keep automation, intent execution, 
// workflows, scheduling, and capabilities off the main Electron thread.

const { parentPort } = require('electron');

if (parentPort) {
  parentPort.on('message', async (event) => {
    // Standard IPC Request Contract
    // { id, worker, capability, action, payload, priority, timeout }
    const request = event.data;
    const startTs = Date.now();

    try {
      if (request.action === 'ping') {
        return sendResponse(request.id, true, { status: 'ready', type: 'automation' }, null, startTs);
      }
      
      // TODO: Move heavy automation and capability execution logic here
      // For now, echo the intent for testing
      
      if (request.action === 'execute.intent') {
        // Simulate some work
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return sendResponse(request.id, true, { 
          message: `Successfully executed intent: ${request.payload?.intent || 'unknown'}`,
          processedPayload: request.payload
        }, null, startTs);
      }

      throw new Error(`Unknown action: ${request.action}`);

    } catch (err) {
      sendResponse(request.id, false, null, err.message, startTs);
    }
  });
}

/**
 * Enforces the standardized IPC Response Contract
 */
function sendResponse(id, success, result, errorMsg, startTs) {
  if (!parentPort || !id) return;
  
  parentPort.postMessage({
    id,
    success,
    result,
    error: errorMsg,
    metrics: {
      durationMs: Date.now() - startTs,
      memoryMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
    }
  });
}

// Keep process alive but lightweight
setInterval(() => {}, 60000);
