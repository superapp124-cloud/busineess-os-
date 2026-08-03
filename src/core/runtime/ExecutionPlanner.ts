import { MissionPlan } from './MissionPlanner';
import { ExecutionStep, Recommendation } from '../types';

export interface ExecutableMission {
  plan: MissionPlan;
  executionSequence: string[]; // Order of capability execution
}

/**
 * Execution Planner
 * Decides HOW the mission happens by sequencing the required capabilities.
 */
export class ExecutionPlanner {
  
  public async buildExecutionPlan(plan: MissionPlan): Promise<ExecutableMission> {
    console.log(`[ExecutionPlanner] Sequencing ${plan.requiredCapabilities.length} capabilities...`);
    
    // In production, this builds a DAG based on capability prerequisites.
    // For Phase 3 demo, we just sequence them sequentially.
    const sequence = plan.requiredCapabilities.map(c => c.metadata.id);

    return {
      plan,
      executionSequence: sequence
    };
  }

  /**
   * Executes the sequence. This forms the Decision Intelligence layer that feeds the UI.
   */
  public async execute(mission: ExecutableMission): Promise<Recommendation[]> {
    let allRecommendations: Recommendation[] = [];
    
    for (const capId of mission.executionSequence) {
      const cap = mission.plan.requiredCapabilities.find(c => c.metadata.id === capId);
      if (cap) {
        console.log(`[ExecutionPlanner] Executing capability: ${cap.metadata.name}`);
        const results = await cap.execute(mission.plan.graph);
        if (Array.isArray(results)) {
          allRecommendations.push(...results);
        }
      }
    }

    return allRecommendations;
  }
}
