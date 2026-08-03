import { EnterpriseEvent, ProjectionHandler } from '../types';
import { EnterpriseStateEngine } from './EnterpriseStateEngine';

export class EnterpriseStateProjection implements ProjectionHandler {
  public name = 'EnterpriseStateProjection';
  public version = '1.0.0';
  
  private stateEngine: EnterpriseStateEngine;
  private lastEventId: string = '';
  private lastTimestamp: string = '';
  private processedCount: number = 0;

  constructor() {
    this.stateEngine = EnterpriseStateEngine.getInstance();
  }

  public async applyEvent(event: EnterpriseEvent): Promise<void> {
    const relevantEvents = [
      'MissionCreated', 
      'MissionStateChanged',
      'MissionApproved',
      'MissionRejected',
      'ExecutionStarted',
      'ExecutionStepStarted',
      'ExecutionStepCompleted',
      'ExecutionStepFailed',
      'ExecutionRolledBack',
      'ExecutionCompleted',
      'SystemStateUpdated',
      'ConnectorStateChanged'
    ];

    if (relevantEvents.includes(event.type)) {
      console.log(`[EnterpriseStateProjection] Applying ${event.type} to State Engine...`);
      
      const payload = event.payload as any;
      if (payload.missionContext) {
        const missionStore = this.stateEngine.getStore('mission');
        missionStore.set(payload.missionContext.id, payload.missionContext);
      }

      this.lastEventId = event.id;
      this.lastTimestamp = event.occurredAt;
      this.processedCount++;
    }
  }

  public getCheckpoint(): string {
    return `${this.processedCount}-state-mutations`;
  }

  public getLastEventId(): string {
    return this.lastEventId;
  }

  public getLastTimestamp(): string {
    return this.lastTimestamp;
  }
}
