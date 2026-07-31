import { Decision, Outcome, IOutcomeEngine } from './types';

export interface OutcomePlugin {
  supports(decision: Decision): boolean;
  predictOutcomes(decision: Decision): Promise<Outcome[]>;
}

export class OutcomeEngine implements IOutcomeEngine {
  private plugins: OutcomePlugin[] = [];

  registerPlugin(plugin: OutcomePlugin) {
    this.plugins.push(plugin);
  }

  async predictOutcomes(decision: Decision): Promise<Outcome[]> {
    const plugin = this.plugins.find(p => p.supports(decision));
    if (plugin) {
      return plugin.predictOutcomes(decision);
    }

    return [
      { id: `out_${Date.now()}`, description: `${decision.label} action logged`, status: 'Pending' }
    ];
  }
}
