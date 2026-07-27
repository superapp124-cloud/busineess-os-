import { Worker } from './workers/Worker.js';

export class WorkerRegistry {
    private static workers: Map<string, Worker> = new Map();

    public static register(worker: Worker): void {
        this.workers.set(worker.metadata.id, worker);
        console.log(`[WorkerRegistry] Registered worker: ${worker.metadata.id} (${worker.metadata.name})`);
    }

    public static getWorker(id: string): Worker | undefined {
        return this.workers.get(id);
    }

    public static getAllWorkers(): Worker[] {
        return Array.from(this.workers.values());
    }

    public static getWorkersForCapability(capability: string): Worker[] {
        return this.getAllWorkers().filter(w => w.metadata.capability === capability || w.metadata.capability === 'Core');
    }
}
