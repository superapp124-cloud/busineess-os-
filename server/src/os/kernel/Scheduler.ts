import { globalEventBus } from './EventBus';

export type Task = {
  id: string;
  missionId: string;
  capability: string;
  payload: any;
  status: 'pending' | 'running' | 'completed' | 'failed';
};

export class Scheduler {
  private queue: Task[] = [];
  private activeWorkers = new Map<string, Task>();

  public scheduleTask(missionId: string, capability: string, payload: any): string {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const task: Task = {
      id: taskId,
      missionId,
      capability,
      payload,
      status: 'pending'
    };
    this.queue.push(task);
    
    // Simulate background scheduling
    setTimeout(() => this.processQueue(), 0);
    
    return taskId;
  }

  private async processQueue() {
    if (this.queue.length === 0) return;
    
    // Simple concurrent execution for now
    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        this.executeTask(task);
      }
    }
  }

  private async executeTask(task: Task) {
    task.status = 'running';
    this.activeWorkers.set(task.id, task);
    
    // In a real system, this routes to the CapabilityScheduler -> Providers
    // For now, it just mocks successful dispatch
    console.log(`[Scheduler] Dispatched task ${task.id} for capability ${task.capability}`);
    
    // Emit event that capability is starting
    globalEventBus.publish({
      type: 'PROVIDER_STARTED',
      payload: {
        missionId: task.missionId,
        capability: task.capability,
        provider: 'Pending Assignment' // Will be assigned by CapabilityRuntime
      }
    });
    
    task.status = 'completed';
    this.activeWorkers.delete(task.id);
  }
}

export const globalScheduler = new Scheduler();
