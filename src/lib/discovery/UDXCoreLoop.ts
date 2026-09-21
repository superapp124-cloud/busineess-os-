import { TenantId, DemandEntity, UDXOpportunity, SearchMemoryEntry } from './types';
import { GSCConnector } from './connectors/GSCConnector';
import { DemandGraph } from './DemandGraph';
import { OpportunityEngine } from './OpportunityEngine';
import { PolicyEngine } from './PolicyEngine';
import { ExperimentEngine } from './ExperimentEngine';
import { SearchMemory } from './SearchMemory';
import { RevenueAttributionEngine } from './RevenueAttribution';
import { CEOAgent } from './agents/CEOAgent';
import { AgentInput } from './agents/AgentContracts';

export interface CoreLoopResult {
  loopRunId: string;
  stepsCompleted: string[];
  entitiesProcessed: number;
  opportunitiesFound: number;
  actionsQueued: number;
  topRecommendations: any[];
  errorsEncountered: string[];
}

/**
 * UDX Core Loop Orchestrator
 * Wires the golden path together on talentxcel.in / target tenant.
 * Server-side execution only.
 */
export class UDXCoreLoop {
  private supabase: any;
  private gscConnector: GSCConnector;
  private demandGraph: DemandGraph;
  private oppEngine: OpportunityEngine;
  private policyEngine: PolicyEngine;
  private expEngine: ExperimentEngine;
  private searchMemory: SearchMemory;
  private revEngine: RevenueAttributionEngine;
  private ceoAgent: CEOAgent;

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
    this.gscConnector = new GSCConnector();
    this.demandGraph = new DemandGraph();
    this.oppEngine = new OpportunityEngine();
    this.policyEngine = new PolicyEngine(this.supabase);
    this.expEngine = new ExperimentEngine(this.supabase);
    this.searchMemory = new SearchMemory(this.supabase);
    this.revEngine = new RevenueAttributionEngine(this.supabase);
    this.ceoAgent = new CEOAgent();
  }

  /**
   * Executes the full UDX pipeline:
   * 1. GSC sync (live API or existing DB rows)
   * 2. Demand Graph enrichment (normalize, intent, audience, destination)
   * 3. Opportunity Scoring (calculate_udx_opportunities RPC)
   * 4. CEO & Specialist AI Organization analysis
   * 5. Policy Engine evaluation (AUTO / REVIEW / FORBIDDEN)
   * 6. Audit log logging
   */
  async runCoreLoop(tenantId: TenantId = 'talentxcel'): Promise<CoreLoopResult> {
    const loopRunId = `loop_${Date.now()}`;
    const stepsCompleted: string[] = [];
    const errorsEncountered: string[] = [];
    let entitiesProcessed = 0;
    let opportunitiesFound = 0;
    let actionsQueued = 0;
    let topRecommendations: any[] = [];
    
    await this.logStep(tenantId, loopRunId, 'loop_start', 'SUCCESS');

    try {
      // ─── 1. GSC Sync ────────────────────────────────────────────────────────
      try {
        const syncResult = await this.gscConnector.sync(tenantId);
        stepsCompleted.push(`gsc_sync (${syncResult.rowsInserted} rows)`);
      } catch (gscErr: any) {
        // If GSC credentials aren't provided in this environment run, log and continue with existing DB entities
        errorsEncountered.push(`gsc_sync: ${gscErr.message}`);
        await this.logStep(tenantId, loopRunId, 'gsc_sync_warning', 'FAILED', gscErr.message);
      }

      // ─── 2. Fetch Demand Entities from DB ───────────────────────────────────
      const { data: dbEntities, error: entityErr } = await this.supabase
        .from('udx_demand_entities')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('impressions', { ascending: false })
        .limit(200);

      if (entityErr) {
        throw new Error(`Failed to fetch demand entities: ${entityErr.message}`);
      }

      // ─── 3. Process with Demand Graph ───────────────────────────────────────
      if (dbEntities && dbEntities.length > 0) {
        entitiesProcessed = dbEntities.length;
        for (const entity of dbEntities) {
          // If entity needs classification
          if (!entity.intent || !entity.audience || !entity.product_destination) {
            const { intent, confidence: intentConf } = this.demandGraph.classifyIntent(entity.query);
            const { audience, confidence: audConf } = this.demandGraph.classifyAudience(entity.query, intent);
            const { segment, confidence: segConf } = this.demandGraph.classifyBusinessSegment(entity.query, intent, audience);
            const destination = this.demandGraph.resolveProductDestination(segment, intent, entity.country || 'in');

            await this.supabase
              .from('udx_demand_entities')
              .update({
                normalized_query: this.demandGraph.normalize(entity.query),
                intent,
                audience,
                business_segment: segment,
                product_destination: destination,
                last_updated_at: new Date().toISOString()
              })
              .eq('entity_id', entity.entity_id);
          }
        }
        stepsCompleted.push(`demand_graph_enrichment (${entitiesProcessed} entities)`);
      } else {
        stepsCompleted.push('demand_graph_enrichment (0 entities awaiting GSC data)');
      }

      // ─── 4. Opportunity Scoring (RPC) ──────────────────────────────────────
      const { data: oppCount, error: rpcErr } = await this.supabase.rpc('calculate_udx_opportunities', {
        p_tenant_id: tenantId
      });

      if (rpcErr) {
        errorsEncountered.push(`calculate_udx_opportunities RPC: ${rpcErr.message}`);
      } else {
        opportunitiesFound = typeof oppCount === 'number' ? oppCount : 0;
        stepsCompleted.push(`opportunity_scoring (${opportunitiesFound} scored)`);
      }

      // ─── 5. Fetch Top Opportunities for AI Organization ─────────────────────
      const { data: topOpps } = await this.supabase
        .from('udx_opportunities')
        .select(`
          opportunity_id,
          tenant_id,
          opportunity_type,
          quadrant,
          priority,
          opportunity_score,
          score_demand,
          score_commercial_value,
          score_competitive_gap,
          score_conversion_potential,
          score_product_fit,
          score_confidence,
          score_execution_cost,
          recommended_action,
          evidence_chain,
          status,
          created_at,
          udx_demand_entities (
            entity_id, query, normalized_query, impressions, clicks, ctr, avg_position, country, device, intent, audience, business_segment
          )
        `)
        .eq('tenant_id', tenantId)
        .order('opportunity_score', { ascending: false })
        .limit(50);

      // ─── 6. AI CEO + Specialist Agents Synthesis ────────────────────────────
      if (topOpps && topOpps.length > 0) {
        // Read Search Memory for context
        const { data: searchMemoryData } = await this.supabase
          .from('udx_search_memory')
          .select('*')
          .eq('tenant_id', tenantId)
          .order('confidence', { ascending: false })
          .limit(20);

        const agentInput: AgentInput = {
          tenantId,
          loopRunId,
          opportunities: topOpps.map((o: any) => ({
            id: o.opportunity_id,
            tenantId: o.tenant_id,
            title: o.udx_demand_entities?.query || o.opportunity_type,
            description: o.recommended_action || `${o.quadrant} opportunity for ${o.udx_demand_entities?.query}`,
            quadrant: o.quadrant,
            status: o.status,
            score: o.opportunity_score,
            scoreComponents: {
              demandScore: o.score_demand,
              commercialValueScore: o.score_commercial_value,
              conversionPotentialScore: o.score_conversion_potential,
              competitiveGapScore: o.score_competitive_gap,
              productFitScore: o.score_product_fit,
              confidenceScore: o.score_confidence,
              executionCostEstimate: o.score_execution_cost,
              weightsVersion: 'v1.0.0-heuristic'
            },
            evidenceChain: o.evidence_chain || {},
            provenance: {
              source: 'udx_opportunities',
              timestamp: o.created_at,
              confidence: o.score_confidence || 0.8
            }
          })),
          demandEntities: (dbEntities || []).map((e: any) => ({
            id: e.entity_id,
            tenantId: e.tenant_id,
            query: e.query,
            intent: e.intent,
            intentConfidence: 0.9,
            audience: e.audience,
            audienceConfidence: 0.85,
            segment: e.business_segment,
            segmentConfidence: 0.85,
            country: e.country,
            device: e.device,
            searchAppearances: e.impressions,
            clicks: e.clicks,
            impressions: e.impressions,
            ctr: e.ctr,
            position: e.avg_position,
            provenance: {
              source: e.data_source || 'gsc_api',
              timestamp: e.last_updated_at,
              confidence: 1.0
            }
          })),
          searchMemory: (searchMemoryData || []).map((m: any) => ({
            id: m.memory_id,
            tenantId: m.tenant_id,
            pattern: m.content_pattern || m.query_cluster,
            context: m.intent || '',
            lessonLearned: m.outcome || '',
            observationsCount: m.observations || 1,
            confidence: m.confidence || 0.5,
            lastConfirmedAt: m.last_confirmed_at,
            provenance: {
              source: 'udx_search_memory',
              timestamp: m.first_observed_at,
              confidence: m.confidence || 0.5
            }
          })),
          timestamp: new Date().toISOString()
        };

        const ceoOutput = await this.ceoAgent.analyze(agentInput);
        topRecommendations = ceoOutput.recommendations;
        stepsCompleted.push(`ai_ceo_analysis (${topRecommendations.length} ranked actions)`);

        // ─── 7. Policy Engine Evaluation ──────────────────────────────────────
        for (const rec of topRecommendations) {
          try {
            const decision = await this.policyEngine.evaluate(rec.action, { tenantId, loopRunId });
            
            if (decision.policyClass === 'AUTO') {
              actionsQueued++;
            } else if (decision.policyClass === 'REVIEW') {
              await this.policyEngine.createApprovalRequest(
                rec.action,
                rec.expectedOutcome,
                rec.evidenceSummary,
                tenantId
              );
            }
          } catch (policyErr: any) {
            errorsEncountered.push(`Policy violation for ${rec.action}: ${policyErr.message}`);
          }
        }
        stepsCompleted.push('policy_evaluation');
      } else {
        stepsCompleted.push('ai_ceo_analysis (0 opportunities to evaluate)');
      }

      await this.logStep(tenantId, loopRunId, 'loop_complete', 'SUCCESS', {
        entitiesProcessed,
        opportunitiesFound,
        actionsQueued
      });
      
    } catch (error: any) {
      await this.logStep(tenantId, loopRunId, 'loop_failed', 'FAILED', error.message);
      errorsEncountered.push(error.message);
    }
    
    return {
      loopRunId,
      stepsCompleted,
      entitiesProcessed,
      opportunitiesFound,
      actionsQueued,
      topRecommendations,
      errorsEncountered
    };
  }
  
  private async logStep(tenantId: TenantId, loopId: string, action: string, status: string, details?: any): Promise<void> {
    if (this.supabase) {
      try {
        await this.supabase.from('udx_audit_log').insert({
          tenant_id: tenantId,
          log_type: 'EXECUTION',
          actor: 'UDX_CORE_LOOP',
          action_taken: action,
          policy_class: 'AUTO',
          outcome: status === 'SUCCESS' ? 'AUTO_EXECUTED' : 'FORBIDDEN_BLOCKED',
          metadata: { loopId, details },
          created_at: new Date().toISOString()
        });
      } catch (logErr) {
        console.error('[UDXCoreLoop] Failed to log step to audit log:', logErr);
      }
    }
  }
}
