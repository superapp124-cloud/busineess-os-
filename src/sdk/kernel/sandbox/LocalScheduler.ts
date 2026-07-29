import { IResourceScheduler, IResourceLimits, IResourceUsage } from './IResourceScheduler';

export class LocalScheduler implements IResourceScheduler {
  private usageMap = new Map<string, IResourceUsage>();

  async scheduleTask(capabilityId: string, taskFn: () => Promise<any>): Promise<any> {
    // In a real implementation, we'd check limits here before executing
    // and queue the task if concurrency limits are reached.
    const start = performance.now();
    try {
      const result = await taskFn();
      const duration = performance.now() - start;
      this.recordUsage(capabilityId, { cpuUsageMs: duration });
      return result;
    } catch (error) {
      throw error;
    }
  }

  checkLimits(capabilityId: string, limits: IResourceLimits): boolean {
    const usage = this.usageMap.get(capabilityId) || this.getEmptyUsage();
    
    if (limits.maxCpuMs && usage.cpuUsageMs > limits.maxCpuMs) return false;
    if (limits.maxAiTokens && usage.aiTokensUsed > limits.maxAiTokens) return false;
    if (limits.maxApiCalls && usage.apiCallsMade > limits.maxApiCalls) return false;

    return true;
  }

  recordUsage(capabilityId: string, usageDelta: Partial<IResourceUsage>): void {
    const current = this.usageMap.get(capabilityId) || this.getEmptyUsage();
    
    current.cpuUsageMs += (usageDelta.cpuUsageMs || 0);
    current.memoryBytes += (usageDelta.memoryBytes || 0);
    current.aiTokensUsed += (usageDelta.aiTokensUsed || 0);
    current.apiCallsMade += (usageDelta.apiCallsMade || 0);

    this.usageMap.set(capabilityId, current);
  }

  private getEmptyUsage(): IResourceUsage {
    return { cpuUsageMs: 0, memoryBytes: 0, aiTokensUsed: 0, apiCallsMade: 0 };
  }
}
