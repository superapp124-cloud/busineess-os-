import { supabase } from '@/integrations/supabase/client';

export interface GraphNode {
  id: string;
  entityId: string;
  recordId: string;
  label: string;
}

export interface GraphEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationshipType: string;
}

export class BusinessGraph {
  /**
   * Retrieves all related nodes for a given record by traversing the graph.
   * This is much more flexible than complex SQL joins, as it discovers 
   * unexpected or indirect relationships (e.g. Customer -> Ticket -> Employee).
   */
  /**
   * Retrieves all related nodes for a given record by traversing the graph.
   * Hard-enforces tenant isolation across all recursive CTE hops.
   */
  static async getRelated(
    recordId: string, 
    tenantId: string, 
    depth: number = 1
  ): Promise<{ nodes: GraphNode[], edges: GraphEdge[] }> {
    if (!tenantId || tenantId.trim().length === 0) {
      throw new Error('[BusinessGraph Security Violation] tenantId is required for graph traversal');
    }

    const { data, error } = await supabase.rpc('traverse_business_graph', { 
      start_record_id: recordId,
      tenant_id_param: tenantId,
      max_depth: depth 
    });

    if (error) {
      console.error('Graph traversal failed or blocked by tenant isolation policy', error);
      return { nodes: [], edges: [] };
    }

    const nodes = new Map<string, GraphNode>();
    const edges = new Map<string, GraphEdge>();

    data?.forEach((row: any) => {
      // Security Filter: Reject any node that doesn't match tenantId
      if (row.tenant_id && row.tenant_id !== tenantId) {
        console.error(`[BusinessGraph Security Block] Dropped node ${row.id} belonging to different tenant ${row.tenant_id}`);
        return;
      }

      if (!nodes.has(row.id)) {
        nodes.set(row.id, { id: row.id, entityId: row.entity_id, recordId: row.record_id, label: row.label });
      }
      if (row.edge_id && !edges.has(row.edge_id)) {
        edges.set(row.edge_id, { 
          id: row.edge_id, 
          sourceNodeId: row.source_node_id, 
          targetNodeId: row.target_node_id, 
          relationshipType: row.relationship_type 
        });
      }
    });

    return { nodes: Array.from(nodes.values()), edges: Array.from(edges.values()) };
  }

  static async link(
    sourceRecordId: string, 
    targetRecordId: string, 
    relationshipType: string, 
    tenantId: string, 
    context: any
  ) {
    if (!tenantId) throw new Error('[BusinessGraph Security Violation] tenantId required for linking nodes');
    // Logic to create edges between nodes in the graph scoped to tenantId
  }
}
