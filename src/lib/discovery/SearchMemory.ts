import { SearchMemoryEntry, TenantId, UDXIntentClass, UDXAudience } from './types';

/**
 * Search Memory System
 * The accumulated moat: append-only knowledge base
 */
export class SearchMemory {
  
  private supabase: any;
  
  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
  }

  /**
   * Writes a new entry to memory (APPEND ONLY)
   */
  async write(entry: Omit<SearchMemoryEntry, 'id' | 'observationsCount' | 'lastConfirmedAt'>): Promise<SearchMemoryEntry> {
    const fullEntry: SearchMemoryEntry = {
      ...entry,
      id: `mem_${Date.now()}`,
      observationsCount: 1,
      lastConfirmedAt: new Date().toISOString()
    };
    
    if (this.supabase) {
      await this.supabase.from('udx_search_memory').insert({
        id: fullEntry.id,
        tenant_id: fullEntry.tenantId,
        pattern: fullEntry.pattern,
        context: fullEntry.context,
        lesson_learned: fullEntry.lessonLearned,
        observations_count: fullEntry.observationsCount,
        confidence: fullEntry.confidence,
        last_confirmed_at: fullEntry.lastConfirmedAt,
        provenance: JSON.stringify(fullEntry.provenance)
      });
    }
    
    return fullEntry;
  }

  /**
   * Confirms an existing memory, strengthening its confidence
   */
  async confirm(memoryId: string): Promise<void> {
    if (this.supabase) {
      // Use RPC to atomically increment
      await this.supabase.rpc('confirm_search_memory', {
        p_memory_id: memoryId,
        p_timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Queries memories relevant to context
   */
  async query(
    tenantId: TenantId, 
    queryCluster: string, 
    intent: UDXIntentClass, 
    audience: UDXAudience, 
    country: string
  ): Promise<SearchMemoryEntry[]> {
    if (!this.supabase) return [];
    
    const { data } = await this.supabase.from('udx_search_memory')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('confidence', { ascending: false });
      
    // Filter by context in application layer for now
    return (data || []).map((d: any) => ({
      id: d.id,
      tenantId: d.tenant_id,
      pattern: d.pattern,
      context: d.context,
      lessonLearned: d.lesson_learned,
      observationsCount: d.observations_count,
      confidence: d.confidence,
      lastConfirmedAt: d.last_confirmed_at,
      provenance: JSON.parse(d.provenance)
    }));
  }

  /**
   * Returns memories applicable to a content decision
   */
  async getApplicableRules(tenantId: TenantId, contentDecision: string): Promise<SearchMemoryEntry[]> {
    // Mock implementation
    return this.query(tenantId, '', 'DISCOVERY', 'unknown', 'US');
  }

  /**
   * Summarizes high-level stats of the search memory
   */
  async summarize(tenantId: TenantId): Promise<any> {
    if (!this.supabase) return null;
    
    const { data, count } = await this.supabase.from('udx_search_memory')
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .order('confidence', { ascending: false })
      .limit(10);
      
    const avgConf = data && data.length > 0 
      ? data.reduce((sum: number, d: any) => sum + d.confidence, 0) / data.length 
      : 0;
      
    return {
      totalPatterns: count,
      avgConfidence: avgConf,
      topPatterns: data
    };
  }
}
