import { EnterpriseObject, GraphEdge, EnterpriseEvent } from '../types';
import { DistributedGraphStore, TraversalPath } from '../persistence/DistributedGraphStore';

/**
 * Enterprise Graph
 * Unified semantic property graph exposing a powerful read API.
 * Mutations ONLY happen through the Projection Engine via applyEvent().
 */
export class EnterpriseGraph {
  private static instance: EnterpriseGraph;
  private db = DistributedGraphStore.getInstance();

  private constructor() {}

  public static getInstance(): EnterpriseGraph {
    if (!EnterpriseGraph.instance) {
      EnterpriseGraph.instance = new EnterpriseGraph();
    }
    return EnterpriseGraph.instance;
  }

  public async initialize(): Promise<void> {
    await this.db.connect();
    console.log('[EnterpriseGraph] Graph engine initialized with Multi-Hop Indexing & Snapshot capabilities.');
  }

  // ------------------------------------------------------------------
  // MUTATION API (Restricted to Projection Engine)
  // Synchronous contract-driven event projection
  // ------------------------------------------------------------------
  public async applyEvent(event: EnterpriseEvent): Promise<void> {
    switch (event.type) {
      case 'EnterpriseObjectCreated':
      case 'EnterpriseObjectUpdated': {
        const payload = event.payload as any;
        if (payload && payload.id && payload.type && payload.name) {
          await this.db.executeWrite('MERGE (n:EnterpriseObject {id: $id}) SET n += $props', payload);
        }
        break;
      }
      case 'EnterpriseObjectDeleted': {
        const payload = event.payload as any;
        if (payload && payload.id) {
          await this.db.executeWrite('MATCH (n {id: $id}) DETACH DELETE n', payload);
        }
        break;
      }
      case 'GraphEdgeCreated':
      case 'GraphEdgeUpdated': {
        const payload = event.payload as any;
        if (payload && payload.id && payload.sourceId && payload.targetId && payload.relationship) {
          await this.db.executeWrite(
            'MATCH (a {id: $sourceId}), (b {id: $targetId}) MERGE (a)-[r:RELATION {id: $id, type: $relationship}]->(b)',
            payload
          );
        }
        break;
      }
      case 'GraphEdgeDeleted': {
        const payload = event.payload as any;
        if (payload && payload.id) {
          await this.db.executeWrite('MATCH ()-[r {id: $id}]->() DELETE r', payload);
        }
        break;
      }
    }
  }

  // ------------------------------------------------------------------
  // READ & QUERY API (Context & Inference Engine)
  // ------------------------------------------------------------------

  public async getNode(id: string): Promise<EnterpriseObject | null> {
    const res = await this.db.executeRead('MATCH (n {id: $id})', { id });
    return res[0] || null;
  }

  public async getRelatedNodes(id: string): Promise<{ edge: GraphEdge; target: EnterpriseObject }[]> {
    const res = await this.db.executeRead('MATCH (a)-[r]->(b) WHERE a.id = $id', { id });
    return res;
  }

  public async getAllNodes(): Promise<EnterpriseObject[]> {
    return await this.db.executeRead('MATCH (n:EnterpriseObject)');
  }

  /**
   * Fast indexed property search
   */
  public findNodesByProperty(key: string, value: string): EnterpriseObject[] {
    return this.db.findNodesByProperty(key, value);
  }

  /**
   * Multi-hop relationship traversal
   */
  public traverse(startNodeId: string, maxDepth = 2, filterEdgeTypes?: string[]): TraversalPath[] {
    return this.db.traverseMultiHop(startNodeId, maxDepth, filterEdgeTypes);
  }

  /**
   * Graph snapshot export/import
   */
  public exportSnapshot() {
    return this.db.exportSnapshot();
  }

  public importSnapshot(snapshot: { nodes: EnterpriseObject[]; edges: GraphEdge[] }) {
    this.db.importSnapshot(snapshot);
  }
}
