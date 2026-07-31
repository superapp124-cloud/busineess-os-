import { ArtifactState, Goal, Decision, IDecisionEngine } from './types';

export interface DecisionPlugin {
  supports(goal: Goal): boolean;
  findDecisions(state: ArtifactState, goal: Goal): Promise<Decision[]>;
}

export class DecisionEngine implements IDecisionEngine {
  private plugins: DecisionPlugin[] = [];

  registerPlugin(plugin: DecisionPlugin) {
    this.plugins.push(plugin);
  }

  async findDecisions(state: ArtifactState, goal: Goal): Promise<Decision[]> {
    const plugin = this.plugins.find(p => p.supports(goal));
    if (plugin) {
      return plugin.findDecisions(state, goal);
    }

    return [
      { id: 'dec_approve', label: 'Approve', type: 'Approve', impact: 'Medium' },
      { id: 'dec_reject', label: 'Reject', type: 'Reject', impact: 'Medium' }
    ];
  }
}
