/**
 * CHATR Document Processing Async Queue & Worker
 * Manages streaming multi-page document ingestion tasks asynchronously off the main UI thread.
 */

export interface QueueJob {
  jobId: string;
  documentId: string;
  filePath: string;
  mimeType: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progressPercentage: number;
  addedAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

class DocumentQueueService {
  private queue: QueueJob[] = [];
  private activeJobId: string | null = null;
  private listeners: Set<(job: QueueJob) => void> = new Set();

  /**
   * Add a new document parsing job to the background queue
   */
  public enqueue(filePath: string, mimeType = 'application/pdf'): QueueJob {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const job: QueueJob = {
      jobId,
      documentId,
      filePath,
      mimeType,
      status: 'queued',
      progressPercentage: 0,
      addedAt: new Date().toISOString(),
    };

    this.queue.push(job);
    this.notifyListeners(job);
    this.processNext();
    return job;
  }

  /**
   * Subscribe to queue progress updates
   */
  public onUpdate(callback: (job: QueueJob) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  public updateJobProgress(jobId: string, progressPercentage: number, status?: QueueJob['status'], error?: string): void {
    const job = this.queue.find(j => j.jobId === jobId);
    if (job) {
      job.progressPercentage = Math.min(100, Math.max(0, progressPercentage));
      if (status) job.status = status;
      if (error) job.error = error;
      if (status === 'completed') job.completedAt = new Date().toISOString();
      this.notifyListeners(job);
    }
  }

  private notifyListeners(job: QueueJob): void {
    this.listeners.forEach(cb => cb(job));
  }

  private async processNext(): Promise<void> {
    if (this.activeJobId) return; // Currently busy

    const nextJob = this.queue.find(j => j.status === 'queued');
    if (!nextJob) return;

    this.activeJobId = nextJob.jobId;
    nextJob.status = 'processing';
    nextJob.startedAt = new Date().toISOString();
    this.notifyListeners(nextJob);
  }

  public finishCurrentJob(): void {
    this.activeJobId = null;
    this.processNext();
  }

  public getQueue(): QueueJob[] {
    return [...this.queue];
  }
}

export const DocumentQueue = new DocumentQueueService();
