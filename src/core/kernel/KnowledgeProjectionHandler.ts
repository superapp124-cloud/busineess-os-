import { EnterpriseEvent, ProjectionHandler } from '../types';
import { EnterpriseKnowledgeRuntime } from './knowledge/EnterpriseKnowledgeRuntime';

export class KnowledgeProjectionHandler implements ProjectionHandler {
  public name = 'KnowledgeProjectionHandler';
  public version = '1.0.0';
  
  private knowledgeRuntime: EnterpriseKnowledgeRuntime;
  private lastEventId: string = '';
  private lastTimestamp: string = '';
  private processedCount: number = 0;

  constructor() {
    this.knowledgeRuntime = EnterpriseKnowledgeRuntime.getInstance();
  }

  public async applyEvent(event: EnterpriseEvent): Promise<void> {
    const relevantEvents = [
      'KnowledgeCreated', 
      'KnowledgeUpdated', 
      'KnowledgeDeleted'
    ];

    if (relevantEvents.includes(event.type)) {
      console.log(`[KnowledgeProjectionHandler] Applying ${event.type} to Knowledge Runtime...`);
      
      this.knowledgeRuntime.applyMutation(event);
      
      this.lastEventId = event.id;
      this.lastTimestamp = event.occurredAt;
      this.processedCount++;
    }
  }

  public getCheckpoint(): string {
    return `${this.processedCount}-knowledge-mutations`;
  }

  public getLastEventId(): string {
    return this.lastEventId;
  }

  public getLastTimestamp(): string {
    return this.lastTimestamp;
  }
}
