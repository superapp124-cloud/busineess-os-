import { ResolutionGraph } from './ContextResolutionEngine';
import { ICapability } from '../types';
import { CapabilityMarketplace } from './CapabilityMarketplace';

export interface MissionPlan {
  graph: ResolutionGraph;
  requiredCapabilities: ICapability[];
}

/**
 * Mission Planner
 * Decides WHAT should happen by evaluating the Intent and Context.
 * Looks at the Capability Marketplace and selects the required capabilities.
 */
export class MissionPlanner {
  private marketplace = CapabilityMarketplace.getInstance();

  public async planMission(graph: ResolutionGraph): Promise<MissionPlan> {
    console.log(`[MissionPlanner] Planning mission: ${graph.intent.inferredMission}`);
    
    const requiredCapabilities: ICapability[] = [];
    const allCaps = this.marketplace.getAllCapabilities();

    // In production, an LLM selects capabilities dynamically based on the mission intent.
    // Here we use simple logic to select based on context.
    if (graph.policies.some(p => p.id === 'procurement-4.2')) {
      const riskCap = allCaps.find(c => c.metadata.id === 'cap_risk_evaluation');
      const decisionCap = allCaps.find(c => c.metadata.id === 'cap_decision_support');
      
      if (riskCap) requiredCapabilities.push(riskCap);
      if (decisionCap) requiredCapabilities.push(decisionCap);
    }
    
    if (graph.policies.some(p => p.id === 'hr-hiring-1.1')) {
      const reqMatchCap = allCaps.find(c => c.metadata.id === 'cap_requirement_matching');
      if (reqMatchCap) requiredCapabilities.push(reqMatchCap);
    }

    if (graph.policies.some(p => p.id === 'sales')) {
      const crmCap = allCaps.find(c => c.metadata.id === 'cap_crm_sync');
      if (crmCap) requiredCapabilities.push(crmCap);
    }

    if (graph.policies.some(p => p.id === 'sales')) {
      const crmCap = allCaps.find(c => c.metadata.id === 'cap_crm_sync');
      if (crmCap) requiredCapabilities.push(crmCap);
    }

    if (graph.policies.some(p => p.id === 'finance')) {
      const expenseCap = allCaps.find(c => c.metadata.id === 'cap_expense_processing');
      if (expenseCap) requiredCapabilities.push(expenseCap);
    }

    if (graph.policies.some(p => p.id === 'health')) {
      const medicalCap = allCaps.find(c => c.metadata.id === 'cap_medical_evaluation');
      if (medicalCap) requiredCapabilities.push(medicalCap);
    }

    console.log(`[MissionPlanner] Selected ${requiredCapabilities.length} capabilities for mission.`);

    return {
      graph,
      requiredCapabilities
    };
  }
}
