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

export interface JourneyStep {
  iconType?: string;
  label: string;
  time: string;
  actor?: string;
  detail?: string;
}

export interface WorkLogItem {
  time: string;
  actor: string;
  action: string;
  target: string;
  type: NodeType;
}

export interface TeamMember {
  id?: string;
  name: string;
  initials: string;
  color: string;
  status: 'online' | 'idle' | 'busy';
  activity: string;
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
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [journeySteps, setJourneySteps] = useState<JourneyStep[]>([]);
  const [workLog, setWorkLog] = useState<WorkLogItem[]>([]);
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

      // Fetch Profiles for Team Members
      let fetchedTeamMembers: TeamMember[] = [];
      try {
        const { data: profilesData, error: profilesError } = await supabase.from('profiles').select('*').limit(20);
        if (!profilesError && profilesData) {
          const colors = ['#6366f1', '#10b981', '#f59e0b', '#0ea5e9', '#a855f7'];
          fetchedTeamMembers = profilesData.map((p, i) => {
            const name = p.full_name || p.username || 'Unknown User';
            return {
              id: p.id,
              name: name,
              initials: name.substring(0, 2).toUpperCase(),
              color: colors[i % colors.length],
              status: Math.random() > 0.5 ? 'online' : (Math.random() > 0.5 ? 'busy' : 'idle'),
              activity: p.status || 'Active'
            };
          });
        }
      } catch (e) {
        console.warn('Could not fetch profiles', e);
      }
      setTeamMembers(fetchedTeamMembers);

      // Fetch Knowledge Events for Journey and WorkLog
      let fetchedWorkLog: WorkLogItem[] = [];
      let fetchedJourneySteps: JourneyStep[] = [];
      try {
        const { data: eventsData, error: eventsError } = await supabase
          .from('knowledge_events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        
        if (!eventsError && eventsData && eventsData.length > 0) {
          fetchedWorkLog = eventsData.map(e => {
             const node = nodesData?.find(n => n.id === e.entity_id || n.entity_id === e.entity_id);
             return {
                time: new Date(e.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                actor: 'System',
                action: e.event_type || 'updated',
                target: node?.title || e.entity_id || 'Unknown',
                type: (node?.entity_type as NodeType) || 'document'
             };
          });

          fetchedJourneySteps = eventsData.map(e => {
             const node = nodesData?.find(n => n.id === e.entity_id || n.entity_id === e.entity_id);
             return {
                iconType: e.entity_type,
                label: e.event_type || 'Event',
                time: new Date(e.created_at).toLocaleDateString(),
                actor: 'System',
                detail: node?.title || e.entity_type
             };
          });
        } else if (nodesData && nodesData.length > 0) {
          // Fallback to nodes history if no events exist
          fetchedWorkLog = nodesData.slice(0, 10).map(n => ({
             time: new Date(n.updated_at || n.created_at || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
             actor: 'System',
             action: 'updated',
             target: n.title,
             type: (n.entity_type as NodeType) || 'document'
          }));
          
          fetchedJourneySteps = nodesData.slice(0, 6).map(n => ({
             iconType: n.entity_type,
             label: 'Created',
             time: new Date(n.created_at || Date.now()).toLocaleDateString(),
             actor: 'System',
             detail: n.title
          }));
        }
      } catch (e) {
        console.warn('Could not fetch knowledge events', e);
      }
      setWorkLog(fetchedWorkLog);
      setJourneySteps(fetchedJourneySteps);

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
    teamMembers,
    journeySteps,
    workLog,
    isLoading,
    refetch: fetchGraph,
    updateNodePosition
  };
}
