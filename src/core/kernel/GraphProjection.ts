import { EnterpriseEvent, ProjectionHandler } from '../types';
import { EnterpriseGraph } from './EnterpriseGraph';

export class GraphProjection implements ProjectionHandler {
  public name = 'GraphProjection';
  public version = '1.0.0';
  
  private graph: EnterpriseGraph;
  private lastEventId: string = '';
  private lastTimestamp: string = '';
  private processedCount: number = 0;

  constructor() {
    this.graph = EnterpriseGraph.getInstance();
  }

  public async applyEvent(event: EnterpriseEvent): Promise<void> {
    // Only process Graph-relevant events to save cycles
    const relevantEvents = [
      'EnterpriseObjectCreated', 
      'EnterpriseObjectUpdated', 
      'EnterpriseObjectDeleted', 
      'GraphEdgeCreated', 
      'GraphEdgeUpdated', 
      'GraphEdgeDeleted'
    ];

    if (relevantEvents.includes(event.type)) {
      this.graph.applyEvent(event);
      
      this.lastEventId = event.id;
      this.lastTimestamp = event.occurredAt;
      this.processedCount++;
    }
  }

  public getCheckpoint(): string {
    return `${this.processedCount}-events-processed`;
  }

  public getLastEventId(): string {
    return this.lastEventId;
  }

  public getLastTimestamp(): string {
    return this.lastTimestamp;
  }
}
