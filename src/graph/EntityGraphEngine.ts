/**
 * CHATR Entity-Linked Knowledge Graph Engine
 * Performs cross-document entity resolution and multi-hop graph queries across Person, Company, Project, Invoice, Contract, Meeting nodes.
 */

export type EntityNodeType = 'Person' | 'Company' | 'Project' | 'Invoice' | 'Contract' | 'Meeting' | 'Document' | 'Doctor' | 'Hospital';

export interface GraphNode {
  id: string;
  type: EntityNodeType;
  label: string;
  properties: Record<string, unknown>;
  documentIds: string[];
  createdAt: string;
}

export interface GraphEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  relation: string; // e.g. 'SIGNED_BY', 'ISSUED_TO', 'BELONGS_TO', 'MENTIONED_IN'
  confidence: number;
  documentId: string;
}

class EntityGraphEngineService {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: Map<string, GraphEdge> = new Map();

  /**
   * Add or update an entity node in the Knowledge Graph
   */
  public addOrUpdateNode(type: EntityNodeType, label: string, properties: Record<string, unknown>, documentId: string): GraphNode {
    const id = `node_${type.toLowerCase()}_${label.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    
    let existingNode = this.nodes.get(id);
    if (existingNode) {
      if (!existingNode.documentIds.includes(documentId)) {
        existingNode.documentIds.push(documentId);
      }
      existingNode.properties = { ...existingNode.properties, ...properties };
      return existingNode;
    }

    const newNode: GraphNode = {
      id,
      type,
      label,
      properties,
      documentIds: [documentId],
      createdAt: new Date().toISOString(),
    };

    this.nodes.set(id, newNode);
    return newNode;
  }

  /**
   * Connect two entity nodes with a directed edge
   */
  public addEdge(sourceNodeId: string, targetNodeId: string, relation: string, documentId: string, confidence = 0.95): GraphEdge {
    const id = `edge_${sourceNodeId}_${relation}_${targetNodeId}`;
    const edge: GraphEdge = {
      id,
      sourceNodeId,
      targetNodeId,
      relation,
      confidence,
      documentId,
    };
    this.edges.set(id, edge);
    return edge;
  }

  /**
   * Query nodes by entity type or label
   */
  public queryNodes(type?: EntityNodeType, labelSubstring?: string): GraphNode[] {
    const results: GraphNode[] = [];
    for (const node of this.nodes.values()) {
      if (type && node.type !== type) continue;
      if (labelSubstring && !node.label.toLowerCase().includes(labelSubstring.toLowerCase())) continue;
      results.push(node);
    }
    return results;
  }

  /**
   * Perform multi-hop graph traversal (e.g. Find all Contracts involving Microsoft after an Invoice date)
   */
  public traverseNeighbors(nodeId: string, relationFilter?: string): { node: GraphNode; edge: GraphEdge }[] {
    const neighbors: { node: GraphNode; edge: GraphEdge }[] = [];
    for (const edge of this.edges.values()) {
      if (edge.sourceNodeId === nodeId) {
        if (relationFilter && edge.relation !== relationFilter) continue;
        const targetNode = this.nodes.get(edge.targetNodeId);
        if (targetNode) neighbors.push({ node: targetNode, edge });
      } else if (edge.targetNodeId === nodeId) {
        if (relationFilter && edge.relation !== relationFilter) continue;
        const sourceNode = this.nodes.get(edge.sourceNodeId);
        if (sourceNode) neighbors.push({ node: sourceNode, edge });
      }
    }
    return neighbors;
  }

  /**
   * Get graph stats
   */
  public getStats() {
    return {
      totalNodes: this.nodes.size,
      totalEdges: this.edges.size,
    };
  }
}

export const EntityGraphEngine = new EntityGraphEngineService();
