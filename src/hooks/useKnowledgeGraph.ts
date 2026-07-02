import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type NodeType = 'meeting' | 'document' | 'person' | 'ai' | 'task' | 'chat';
export type EdgeLabel = 'reviewed' | 'discussed' | 'approved' | 'referenced' | 'assigned' | 'created';

export interface KnowledgeNode {
  id: string;
  type: NodeType;
  title: string;
  x: number;
  y: number;
  subtitle?: string;
  status?: 'live' | 'recent' | 'typing' | 'summarizing' | 'idle';
  meta?: Record<string, string>;
  people?: string[];
  health?: number;
  raw_content?: string;
}

export interface KnowledgeEdge {
  id: string;
  from: string;
  to: string;
  label: EdgeLabel;
  color: string;
}

// Map the UI KnowledgeNode to the Supabase knowledge_nodes schema
const mapNodeToUI = (row: any): KnowledgeNode => {
  return {
    id: row.id,
    type: (row.entity_type as NodeType) || 'document',
    title: row.title,
    subtitle: row.summary,
    raw_content: row.raw_content,
    x: row.metadata?.position?.x || Math.floor(Math.random() * 500),
    y: row.metadata?.position?.y || Math.floor(Math.random() * 500),
    status: row.metadata?.status,
    meta: row.metadata?.meta,
    people: row.metadata?.people,
    health: row.metadata?.health,
  };
};

const mapEdgeToUI = (row: any): KnowledgeEdge => {
  return {
    id: row.id,
    from: row.from_node_id,
    to: row.to_node_id,
    label: (row.relationship_type as EdgeLabel) || 'referenced',
    color: row.metadata?.color || '#3f3f46',
  };
};

export function useKnowledgeGraph() {
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [edges, setEdges] = useState<KnowledgeEdge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGraph = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // In a real app we'd filter by workspace_id, but here we'll just get all nodes for this user's workspace
      const { data: nodesData, error: nodesError } = await supabase
        .from('knowledge_nodes')
        .select('*');

      if (nodesError) throw nodesError;

      const { data: edgesData, error: edgesError } = await supabase
        .from('knowledge_edges')
        .select('*');

      if (edgesError) throw edgesError;

      setNodes((nodesData || []).map(mapNodeToUI));
      setEdges((edgesData || []).map(mapEdgeToUI));
    } catch (err: any) {
      console.error('Error fetching knowledge graph:', err);
      toast.error('Failed to load knowledge graph');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();

    // Setup realtime subscriptions
    const nodesSub = supabase.channel('knowledge_nodes_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'knowledge_nodes' }, () => {
        fetchGraph(); // Re-fetch on any change
      })
      .subscribe();

    const edgesSub = supabase.channel('knowledge_edges_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'knowledge_edges' }, () => {
        fetchGraph(); // Re-fetch on any change
      })
      .subscribe();

    return () => {
      supabase.removeChannel(nodesSub);
      supabase.removeChannel(edgesSub);
    };
  }, []);

  const updateNodePosition = async (id: string, x: number, y: number) => {
    // Optimistic UI update
    setNodes(prev => prev.map(n => n.id === id ? { ...n, x, y } : n));
    
    // Find the current node in DB first to merge metadata
    const { data: currentNode } = await supabase
      .from('knowledge_nodes')
      .select('metadata')
      .eq('id', id)
      .single();

    const metadata = currentNode?.metadata || {};
    
    const { error } = await supabase
      .from('knowledge_nodes')
      .update({
        metadata: {
          ...metadata,
          position: { x, y }
        }
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating node position:', error);
      toast.error('Failed to save node position');
      // Revert optimistic update on failure by re-fetching
      fetchGraph();
    }
  };

  return {
    nodes,
    edges,
    isLoading,
    refetch: fetchGraph,
    updateNodePosition
  };
}
