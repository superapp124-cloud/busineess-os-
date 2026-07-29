export interface IResourceUsage {
  cpuUsageMs: number;
  memoryBytes: number;
  apiCallsMade: number;
  aiTokensUsed: number;
}

export interface IResourceLimits {
  maxCpuMs?: number;
  maxMemoryBytes?: number;
  maxApiCalls?: number;
  maxAiTokens?: number;
}

export interface IResourceScheduler {
  /**
   * Schedule a task for execution, subject to capability resource limits.
   */
  scheduleTask(capabilityId: string, taskFn: () => Promise<any>): Promise<any>;

  /**
   * Check if a capability has exceeded its assigned limits.
   */
  checkLimits(capabilityId: string, limits: IResourceLimits): boolean;

  /**
   * Record resource usage for a capability.
   */
  recordUsage(capabilityId: string, usage: Partial<IResourceUsage>): void;
}
