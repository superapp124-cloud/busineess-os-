import express from 'express';
import { CapabilityScheduler } from './CapabilityScheduler.js';
import { registerCoreWorkers } from './workers/CoreWorkers.js';
import { WorkerContext } from './workers/Worker.js';

// Register standard workers to the Registry
registerCoreWorkers();

export class OSOrchestrator {
  async runGroceryMission(query: string, res: express.Response) {
    const scheduler = new CapabilityScheduler();
    const capability = 'Core'; // Use the Core capability containing our DAG test workers
    
    const context: WorkerContext = {
      missionId: `mission_${Date.now()}`,
      goal: query,
      state: {},
      emit: (event: string, payload: any) => {
        // Broadcast standard raw events down the SSE pipeline to the frontend
        res.write(`data: ${JSON.stringify({ type: event, ...payload })}\n\n`);
      }
    };

    // Transition frontend to the DAG UI view
    context.emit('STATE_CHANGE', { state: 'Planning', message: 'Initializing DAG Scheduler...' });

    try {
      await scheduler.executeMissionDAG(capability, context);
    } catch (e: any) {
      context.emit('MISSION_FAILED', { error: e.message });
    } finally {
      // Transition out of Planning/Activity Stream into the Evidence grid
      context.emit('STATE_CHANGE', { state: 'Approval', message: 'Mission paused: Waiting for user execution approval.' });
      setTimeout(() => res.end(), 1000);
    }
  }
}
