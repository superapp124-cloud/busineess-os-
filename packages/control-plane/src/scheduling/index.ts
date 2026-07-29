export interface ExecutionPolicy {
  /** Evaluated before a job executes — blocks during maintenance windows */
  canExecute(jobId: string, environment: string): Promise<boolean>;
}

export interface ScheduledJob { id: string; name: string; cronExpression: string; environment: string; payload: unknown; }
export interface Scheduler {
  schedule(job: Omit<ScheduledJob, 'id'>): Promise<ScheduledJob>;
  cancel(jobId: string): Promise<void>;
  list(): Promise<ScheduledJob[]>;
}

export interface MaintenanceWindow { id: string; environment: string; from: string; to: string; reason: string; }
export interface MaintenanceWindowManager {
  schedule(window: Omit<MaintenanceWindow, 'id'>): Promise<MaintenanceWindow>;
  isActive(environment: string): Promise<boolean>;
  list(): Promise<MaintenanceWindow[]>;
}
