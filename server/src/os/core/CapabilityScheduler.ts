import { WorkerRegistry } from './WorkerRegistry.js';
import { WorkerContext, Worker } from './workers/Worker.js';

export class CapabilityScheduler {
    
    public async executeMissionDAG(capability: string, context: WorkerContext): Promise<void> {
        context.emit('SCHEDULER_STARTED', { capability });

        const workers = WorkerRegistry.getWorkersForCapability(capability);
        
        // 1. Build the Dependency Graph
        const pending = new Set<string>(workers.map(w => w.metadata.id));
        const completed = new Set<string>();
        const running = new Set<string>();

        // We use a simple event-driven loop to process the DAG
        return new Promise((resolve) => {
            const checkAndRun = () => {
                if (pending.size === 0 && running.size === 0) {
                    context.emit('SCHEDULER_COMPLETED', { capability });
                    resolve();
                    return;
                }

                for (const workerId of pending) {
                    const worker = WorkerRegistry.getWorker(workerId)!;
                    
                    // Check if dependencies are met
                    const depsMet = worker.metadata.dependsOn.every(dep => completed.has(dep));
                    
                    if (depsMet && worker.canHandle(context)) {
                        pending.delete(workerId);
                        running.add(workerId);
                        
                        context.emit('WORKER_STARTED', { workerId: worker.metadata.id, name: worker.metadata.name });
                        
                        // Execute async (non-blocking the loop)
                        worker.execute(context).then(result => {
                            running.delete(workerId);
                            completed.add(workerId);
                            context.emit('WORKER_COMPLETED', { 
                                workerId: worker.metadata.id, 
                                name: worker.metadata.name,
                                success: result.success
                            });
                            checkAndRun(); // Trigger next layer of DAG
                        }).catch(err => {
                            running.delete(workerId);
                            context.emit('WORKER_FAILED', { workerId: worker.metadata.id, name: worker.metadata.name, error: err.message });
                            // For simplicity, we just continue, but a real scheduler might halt or retry
                            checkAndRun();
                        });
                    } else if (!worker.canHandle(context)) {
                        // Skip if it can't handle the context
                        pending.delete(workerId);
                        checkAndRun();
                    }
                }
            };

            checkAndRun();
        });
    }
}
