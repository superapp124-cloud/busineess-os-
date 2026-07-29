import { IResourceScheduler, IResourceLimits } from './IResourceScheduler';
import { LocalScheduler } from './LocalScheduler';
import { CapabilityContract } from '../contract/CapabilityContract';

export class CapabilitySandbox {
  // Can be swapped out for RedisScheduler, TemporalScheduler etc.
  private static scheduler: IResourceScheduler = new LocalScheduler();

  /**
   * Executes a capability function inside the sandbox.
   * Enforces resource limits and quotas before and during execution.
   */
  static async executeInSandbox(
    contract: CapabilityContract, 
    taskFn: () => Promise<any>
  ): Promise<any> {
    
    // 1. Resolve limits from contract
    const limits: IResourceLimits = {
      maxAiTokens: contract.resourceLimits?.aiTokensPerMonth,
      maxCpuMs: contract.resourceLimits?.cpuLimit ? parseInt(contract.resourceLimits.cpuLimit) : undefined
    };

    // 2. Pre-execution Limit Check
    if (!this.scheduler.checkLimits(contract.id, limits)) {
      throw new Error(`[CapabilitySandbox] Execution blocked. Capability '${contract.id}' exceeded resource quotas.`);
    }

    // 3. Delegate to the active Scheduler
    return this.scheduler.scheduleTask(contract.id, taskFn);
  }

  /**
   * Used by connectors or AI planners to record token/API usage against a capability
   */
  static recordUsage(capabilityId: string, tokens: number, apiCalls: number) {
    this.scheduler.recordUsage(capabilityId, { aiTokensUsed: tokens, apiCallsMade: apiCalls });
  }
}
