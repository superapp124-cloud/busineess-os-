import { supabase } from '@/integrations/supabase/client';

export interface GraphNode {
  id: string;
  org_id: string;
  node_type: string; // e.g., 'invoice', 'deal', 'candidate', 'company'
  entity_id: string | null; // UUID linking to original record if any
  label: string; // Human readable label
  properties: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  org_id: string;
  source_node_id: string;
  target_node_id: string;
  edge_type: string; // e.g., 'BELONGS_TO', 'PAID_BY', 'GENERATED_FROM'
  properties: Record<string, any>;
}

/**
 * @deprecated Use EnterpriseGraph and EnterpriseKnowledgeRuntime instead.
 * Legacy Supabase adapter for Knowledge Graph.
 */
export class IntentKnowledgeGraph {
  
  constructor() {
    console.warn('[DEPRECATED] IntentKnowledgeGraph is deprecated. Use EnterpriseGraph/EnterpriseKnowledgeRuntime.');
  }
  
  /**
   * Upsert a node into the graph.
   * If an entity_id and node_type are provided, it updates existing.
   */
  async upsertNode(orgId: string, type: string, label: string, entityId?: string, properties: any = {}) {
    const { data, error } = await supabase
      .from('sys_knowledge_nodes')
      .upsert(
        {
          org_id: orgId,
          node_type: type,
          label,
          entity_id: entityId || null,
          properties
        },
        { onConflict: 'org_id, node_type, entity_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('[KnowledgeGraph] Error upserting node:', error);
      throw error;
    }
    return data as GraphNode;
  }

  /**
   * Link two nodes together
   */
  async createEdge(orgId: string, sourceId: string, targetId: string, type: string, properties: any = {}) {
    const { data, error } = await supabase
      .from('sys_knowledge_edges')
      .upsert(
        {
          org_id: orgId,
          source_node_id: sourceId,
          target_node_id: targetId,
          edge_type: type,
          properties
        },
        { onConflict: 'source_node_id, target_node_id, edge_type' }
      )
      .select()
      .single();

    if (error) {
      console.error('[KnowledgeGraph] Error creating edge:', error);
      throw error;
    }
    return data as GraphEdge;
  }

  /**
   * Get all connected neighbors for a specific node
   */
  async getNeighbors(nodeId: string, edgeType?: string) {
    let query = supabase
      .from('sys_knowledge_edges')
      .select(`
        id, edge_type, properties,
        target_node:sys_knowledge_nodes!target_node_id(*)
      `)
      .eq('source_node_id', nodeId);

    if (edgeType) {
      query = query.eq('edge_type', edgeType);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('[KnowledgeGraph] Error fetching neighbors:', error);
      throw error;
    }

    return data;
  }

  /**
   * Search nodes by label text (simple ILIKE for now, can be replaced with vector search)
   */
  async searchNodes(orgId: string, query: string, nodeType?: string) {
    let q = supabase
      .from('sys_knowledge_nodes')
      .select('*')
      .eq('org_id', orgId)
      .ilike('label', `%${query}%`);
      
    if (nodeType) {
      q = q.eq('node_type', nodeType);
    }

    const { data, error } = await q.limit(20);
    if (error) {
      console.error('[KnowledgeGraph] Error searching nodes:', error);
      throw error;
    }
    return data as GraphNode[];
  }
}

export const knowledgeGraph = new IntentKnowledgeGraph();
