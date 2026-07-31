import { Relationship, ContextNode, IWorkGraph } from './types';

export class WorkGraph implements IWorkGraph {
  private nodes: Map<string, any> = new Map();
  private edges: Relationship[] = [];

  async addNode(node: any): Promise<void> {
    this.nodes.set(node.id, node);
  }

  async addEdge(edge: Relationship): Promise<void> {
    this.edges.push(edge);
  }

  async getRelatedNodes(nodeId: string): Promise<ContextNode[]> {
    // In a real implementation, traverse this.edges to find neighbors
    // and map them to ContextNodes.
    
    // For now, return an empty array reflecting an empty graph (No Mock Data).
    return [];
  }
}
