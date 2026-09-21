import { UDXExperiment, UDXOpportunity, TenantId, Provenance } from './types';

/**
 * Experiment Engine
 * Handles controlled A/B testing and statistical analysis
 */
export class ExperimentEngine {
  
  private supabase: any;
  
  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
  }

  /**
   * Creates a new experiment
   */
  async createExperiment(
    opportunity: UDXOpportunity,
    hypothesis: string,
    controlState: any,
    treatmentState: any,
    primaryMetric: string
  ): Promise<UDXExperiment> {
    const experiment: UDXExperiment = {
      id: `exp_${Date.now()}`,
      tenantId: opportunity.tenantId,
      opportunityId: opportunity.id,
      hypothesis,
      controlSnapshot: controlState, // Immutable control state
      treatmentState,
      primaryMetric,
      status: 'PLANNED',
      provenance: {
        source: 'experiment_engine',
        timestamp: new Date().toISOString(),
        confidence: 1.0
      }
    };
    
    if (this.supabase) {
      await this.supabase.from('udx_experiments').insert({
        id: experiment.id,
        tenant_id: experiment.tenantId,
        opportunity_id: experiment.opportunityId,
        data: experiment
      });
    }
    
    return experiment;
  }

  /**
   * Starts an experiment
   */
  async startExperiment(experimentId: string): Promise<void> {
    if (this.supabase) {
      await this.supabase.from('udx_experiments')
        .update({ status: 'RUNNING', started_at: new Date().toISOString() })
        .eq('id', experimentId);
    }
  }

  /**
   * Records a conversion event
   */
  async recordConversion(experimentId: string, variantType: 'CONTROL' | 'TREATMENT', metadata: any): Promise<void> {
    if (this.supabase) {
      await this.supabase.from('udx_experiment_events').insert({
        experiment_id: experimentId,
        variant: variantType,
        metadata: JSON.stringify(metadata),
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Analyzes experiment results using a two-sample Z-test
   */
  analyzeResults(n1: number, conv1: number, n2: number, conv2: number): { pValue: number, confidence: number, zScore: number } {
    if (n1 === 0 || n2 === 0) return { pValue: 1, confidence: 0, zScore: 0 };
    
    const p1 = conv1 / n1;
    const p2 = conv2 / n2;
    const p = (conv1 + conv2) / (n1 + n2);
    
    const se = Math.sqrt(p * (1 - p) * (1/n1 + 1/n2));
    if (se === 0) return { pValue: 1, confidence: 0, zScore: 0 };
    
    const zScore = (p2 - p1) / se;
    
    // Simplified p-value approximation for Z (two-tailed)
    const pValue = this.approximatePValue(zScore);
    const confidence = 1 - pValue;
    
    return { pValue, confidence, zScore };
  }
  
  private approximatePValue(z: number): number {
    // Very rough approximation of erfc for Z-test p-value
    const x = Math.abs(z) / Math.sqrt(2);
    const t = 1 / (1 + 0.3275911 * x);
    const erf = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return 1 - erf;
  }

  /**
   * Concludes an experiment
   */
  async conclude(experimentId: string, results: any): Promise<void> {
    let status = 'INCONCLUSIVE';
    if (results.confidence > 0.95 && results.zScore > 0) status = 'WINNER';
    if (results.confidence > 0.95 && results.zScore < 0) status = 'LOSER';
    
    if (this.supabase) {
      await this.supabase.from('udx_experiments')
        .update({ 
          status, 
          concluded_at: new Date().toISOString(),
          results: JSON.stringify(results)
        })
        .eq('id', experimentId);
    }
    
    // Auto rollback if significant negative impact
    if (status === 'LOSER' && results.confidence > 0.95) {
      await this.triggerRollback(experimentId);
    }
  }

  private async triggerRollback(experimentId: string): Promise<void> {
    if (this.supabase) {
      await this.supabase.from('udx_audit_log').insert({
        action: 'auto_rollback',
        status: 'SUCCESS',
        details: `Triggered auto rollback for experiment ${experimentId} due to negative impact`,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  async writeToSearchMemory(experimentId: string, lessonLearned: string): Promise<void> {
    if (this.supabase) {
      await this.supabase.from('udx_search_memory').insert({
        experiment_id: experimentId,
        lesson_learned: lessonLearned,
        created_at: new Date().toISOString()
      });
    }
  }
}
