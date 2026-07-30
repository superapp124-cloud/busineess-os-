/**
 * CHATR Task Scheduler
 * Priority job queue managing execution order, retry counters, background scheduling, and cancellation.
 */

export interface ScheduledTask {
  id: string;
  name: string;
  priority: number; // Higher number = higher priority
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  retryCount: number;
  maxRetries: number;
  scheduledAt: string;
  runHandler: () => Promise<void>;
}

class TaskSchedulerService {
  private queue: ScheduledTask[] = [];
  private isProcessing = false;

  /**
   * Schedule a new background task
   */
  public schedule(name: string, runHandler: () => Promise<void>, priority = 1, maxRetries = 3): ScheduledTask {
    const task: ScheduledTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      priority,
      status: 'pending',
      retryCount: 0,
      maxRetries,
      scheduledAt: new Date().toISOString(),
      runHandler,
    };

    this.queue.push(task);
    this.sortQueue();
    this.processQueue();
    return task;
  }

  /**
   * Cancel a pending task
   */
  public cancel(taskId: string): boolean {
    const task = this.queue.find(t => t.id === taskId);
    if (task && task.status === 'pending') {
      task.status = 'cancelled';
      return true;
    }
    return false;
  }

  private sortQueue(): void {
    this.queue.sort((a, b) => b.priority - a.priority);
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;

    const nextTask = this.queue.find(t => t.status === 'pending');
    if (!nextTask) return;

    this.isProcessing = true;
    nextTask.status = 'running';

    try {
      await nextTask.runHandler();
      nextTask.status = 'completed';
    } catch (err: any) {
      console.error(`[TaskScheduler] Error executing task ${nextTask.id} (${nextTask.name}):`, err.message);
      if (nextTask.retryCount < nextTask.maxRetries) {
        nextTask.retryCount++;
        nextTask.status = 'pending'; // Re-queue for retry
      } else {
        nextTask.status = 'failed';
      }
    } finally {
      this.isProcessing = false;
      this.processQueue();
    }
  }

  public getQueueStats() {
    return {
      pending: this.queue.filter(t => t.status === 'pending').length,
      running: this.queue.filter(t => t.status === 'running').length,
      completed: this.queue.filter(t => t.status === 'completed').length,
      failed: this.queue.filter(t => t.status === 'failed').length,
    };
  }
}

export const TaskScheduler = new TaskSchedulerService();
