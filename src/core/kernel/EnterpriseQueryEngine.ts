import { EnterpriseGraph } from './EnterpriseGraph';
import { EnterpriseObject, GraphEdge } from '../types';

export class EnterpriseQueryEngine {
  private static instance: EnterpriseQueryEngine;
  private graph: EnterpriseGraph;

  private constructor() {
    this.graph = EnterpriseGraph.getInstance();
  }

  public static getInstance(): EnterpriseQueryEngine {
    if (!EnterpriseQueryEngine.instance) {
      EnterpriseQueryEngine.instance = new EnterpriseQueryEngine();
    }
    return EnterpriseQueryEngine.instance;
  }

  public findRelatedObjects(nodeId: string): { relation: string; node: EnterpriseObject; edge: GraphEdge }[] {
    return this.graph.getRelatedNodesWithEdges(nodeId);
  }

  public findApplicablePolicies(nodeId: string): EnterpriseObject[] {
    const related = this.findRelatedObjects(nodeId);
    return related.filter(r => r.node.type === 'Policy').map(r => r.node);
  }

  public findOpenRisks(nodeId: string): EnterpriseObject[] {
    // In a real system, we'd query for Risk objects or run inference here.
    return [];
  }

  public findConnectedSystems(nodeId: string): EnterpriseObject[] {
    const related = this.findRelatedObjects(nodeId);
    return related.filter(r => r.node.type === 'System').map(r => r.node);
  }
}
