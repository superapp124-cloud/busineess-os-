/**
 * CHATR SI OS — Personal Context Graph
 * src/ai/context/PersonalContextGraph.ts
 *
 * Local entity-relationship knowledge graph representing personal life context:
 * People, Events, Tasks, HealthEvents, Devices, Documents, Conversations,
 * Locations, Routines, and Appointments.
 *
 * 100% device-resident, zero cloud leakage.
 */

export type GraphEntityType = 
  | 'Person'
  | 'Event'
  | 'Task'
  | 'HealthEvent'
  | 'Device'
  | 'Document'
  | 'Conversation'
  | 'Location'
  | 'Routine'
  | 'Appointment';

export type GraphRelationType = 
  | 'belongs_to'
  | 'scheduled_for'
  | 'related_to'
  | 'caused_by'
  | 'before'
  | 'after'
  | 'depends_on'
  | 'associated_with';

export interface GraphEntity {
  id: string;
  type: GraphEntityType;
  name: string;
  attributes: Record<string, unknown>;
  createdAt: number;
}

export interface GraphRelationship {
  sourceId: string;
  relation: GraphRelationType;
  targetId: string;
  weight: number; // 0.0 - 1.0
  metadata?: Record<string, unknown>;
}

export class PersonalContextGraph {
  private static instance: PersonalContextGraph;
  private entities: Map<string, GraphEntity> = new Map();
  private relationships: GraphRelationship[] = [];

  private constructor() {
    this.seedDefaultGraph();
  }

  public static getInstance(): PersonalContextGraph {
    if (!PersonalContextGraph.instance) {
      PersonalContextGraph.instance = new PersonalContextGraph();
    }
    return PersonalContextGraph.instance;
  }

  private seedDefaultGraph(): void {
    // Add default device entity
    this.addEntity({
      id: 'dev_watch_1',
      type: 'Device',
      name: 'Smart Watch',
      attributes: { protocol: 'BLE', connected: true },
      createdAt: Date.now(),
    });
  }

  public addEntity(entity: GraphEntity): void {
    this.entities.set(entity.id, entity);
  }

  public getEntity(id: string): GraphEntity | undefined {
    return this.entities.get(id);
  }

  public addRelationship(sourceId: string, relation: GraphRelationType, targetId: string, weight = 1.0): void {
    // Check if relationship already exists
    const exists = this.relationships.some(
      r => r.sourceId === sourceId && r.relation === relation && r.targetId === targetId
    );
    if (!exists) {
      this.relationships.push({ sourceId, relation, targetId, weight });
    }
  }

  /**
   * Finds all entities connected to a source entity
   */
  public findRelated(entityId: string, relation?: GraphRelationType): GraphEntity[] {
    const matchingEdges = this.relationships.filter(
      r => r.sourceId === entityId && (relation ? r.relation === relation : true)
    );

    const relatedEntities: GraphEntity[] = [];
    for (const edge of matchingEdges) {
      const entity = this.entities.get(edge.targetId);
      if (entity) {
        relatedEntities.push(entity);
      }
    }
    return relatedEntities;
  }

  public getEntitiesByType(type: GraphEntityType): GraphEntity[] {
    return Array.from(this.entities.values()).filter(e => e.type === type);
  }

  public searchEntities(query: string): GraphEntity[] {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return Array.from(this.entities.values()).filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.type.toLowerCase().includes(q) ||
      JSON.stringify(e.attributes).toLowerCase().includes(q)
    );
  }

  public clear(): void {
    this.entities.clear();
    this.relationships = [];
  }

  public getStats(): { entitiesCount: number; relationshipsCount: number } {
    return {
      entitiesCount: this.entities.size,
      relationshipsCount: this.relationships.length,
    };
  }
}

export const personalContextGraph = PersonalContextGraph.getInstance();
