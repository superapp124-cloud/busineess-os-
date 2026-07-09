import { Commitment, CommitmentStatus } from './types';
import { capabilityRegistry } from './CapabilityRegistry';
import { eventBus } from '../services/EventBus';
import { dummyProvider } from '../providers/DummyProvider';
import { playbookEngine } from '../services/PlaybookEngine';
import { telemetry } from '../services/TelemetryService';

export class CommitmentRuntimeImpl {
  private static instance: CommitmentRuntimeImpl;

  private constructor() {
    eventBus.subscribe('chatr:commitment-planned', this.handlePlannedCommitment.bind(this));
    eventBus.subscribe('chatr:commitment-observed', this.handleCommitmentObserved.bind(this));
    eventBus.subscribe('chatr:reality-verified', this.handleRealityVerified.bind(this));
  }

  public static getInstance(): CommitmentRuntimeImpl {
    if (!CommitmentRuntimeImpl.instance) {
      CommitmentRuntimeImpl.instance = new CommitmentRuntimeImpl();
    }
    return CommitmentRuntimeImpl.instance;
  }

  private async handlePlannedCommitment(event: any): Promise<void> {
    const { commitment } = event.payload;
    await this.processCommitment(commitment);
  }

  private async handleCommitmentObserved(event: any): Promise<void> {
    const { commitment } = event.payload;
    await this.transitionState(commitment, 'observed');
  }

  private async handleRealityVerified(event: any): Promise<void> {
    const { commitment, reality } = event.payload;
    const verifiedCommitment = await this.transitionState(commitment, 'reality_verified');
    const completedCommitment = await this.transitionState(verifiedCommitment, 'completed');

    // Telemetry: record completion
    telemetry.track({
      commitmentId: commitment.id,
      capability: commitment.capability,
      event: 'completed',
      provider: reality?.provider,
    });

    // Inject a rich success card into the conversation thread + premium toast
    window.dispatchEvent(new CustomEvent('chatr:outcome-executed', {
      detail: {
        type: commitment.capability?.split('.').pop()?.toUpperCase() || 'COMMITMENT',
        text: `✅ ${commitment.title}`,
        raw: {
          title: commitment.title,
          capability: commitment.capability,
          entities: commitment.entities,
          verifiedAt: new Date().toISOString(),
          transactionId: reality?.transactionId || `TXN-${commitment.id}`,
        }
      }
    }));
  }

  public async processCommitment(commitment: Commitment): Promise<void> {
    console.log(`[CommitmentRuntime] Processing commitment: ${commitment.id} (${commitment.capability})`);

    const capability = capabilityRegistry.getCapability(commitment.capability);
    if (!capability) {
      console.error(`[CommitmentRuntime] Capability not found: ${commitment.capability}`);
      return;
    }

    // 1. Validation
    commitment = await this.transitionState(commitment, 'validated');
    const validation = await capability.validate(commitment);
    if (!validation.isValid) {
      console.warn(`[CommitmentRuntime] Validation failed for ${commitment.id}:`, validation.errors);
      telemetry.track({
        commitmentId: commitment.id,
        capability: commitment.capability,
        event: 'error',
        error: validation.errors?.join(', '),
      });
      eventBus.publish('chatr:commitment-validation-failed', { commitment, errors: validation.errors }, 'CommitmentRuntime');
      return;
    }

    // Transition: validated → suggested
    commitment = await this.transitionState(commitment, 'suggested');

    telemetry.track({
      commitmentId: commitment.id,
      capability: commitment.capability,
      event: 'suggested',
    });

    // 2. Execution Policy evaluation
    const policy = capability.manifest.executionPolicy;

    if (policy === 'immediate') {
      await this.executeCommitment(commitment);
    } else {
      eventBus.publish('chatr:commitment-suggested', { commitment }, 'CommitmentRuntime');
    }
  }

  public async confirmCommitment(commitment: Commitment): Promise<void> {
    const capability = capabilityRegistry.getCapability(commitment.capability);
    if (!capability) return;

    if (commitment.status === 'suggested') {
      telemetry.track({
        commitmentId: commitment.id,
        capability: commitment.capability,
        event: 'confirmed',
      });
      await playbookEngine.run(commitment, capability);
      return;
    } else if (commitment.status === 'preview_ready') {
      commitment = await this.transitionState(commitment, 'confirmed');
      telemetry.track({
        commitmentId: commitment.id,
        capability: commitment.capability,
        event: 'confirmed',
      });
      await this.executeCommitment(commitment);
    }
  }

  private async executeCommitment(commitment: Commitment): Promise<void> {
    const capability = capabilityRegistry.getCapability(commitment.capability);
    if (!capability) return;

    commitment = await this.transitionState(commitment, 'executing');
    telemetry.track({
      commitmentId: commitment.id,
      capability: commitment.capability,
      event: 'executed',
    });

    try {
      const result = await capability.executor(commitment, dummyProvider);

      if (result.success) {
        console.log(`[CommitmentRuntime] Execution successful: ${commitment.id}`);
        commitment = await this.transitionState(commitment, 'waiting');
      } else {
        throw new Error(result.message || 'Execution failed');
      }
    } catch (err: any) {
      console.error(`[CommitmentRuntime] Execution error for ${commitment.id}:`, err);
      telemetry.track({
        commitmentId: commitment.id,
        capability: commitment.capability,
        event: 'execution_failed',
        error: err.message,
      });
      eventBus.publish('chatr:commitment-error', { commitment, error: err.message }, 'CommitmentRuntime');
    }
  }

  private async transitionState(commitment: Commitment, newState: CommitmentStatus): Promise<Commitment> {
    console.log(`[CommitmentRuntime] Transitioning ${commitment.id}: ${commitment.status} → ${newState}`);
    const updatedCommitment = { ...commitment, status: newState, updatedAt: Date.now() };
    eventBus.publish('chatr:commitment-state-changed', updatedCommitment, 'CommitmentRuntime');
    return updatedCommitment;
  }
}

export const commitmentRuntime = CommitmentRuntimeImpl.getInstance();
