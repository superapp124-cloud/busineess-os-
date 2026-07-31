import { ArtifactState, Goal, Readiness, IReadinessEngine } from './types';

export interface ReadinessPlugin {
  supports(goal: Goal): boolean;
  evaluate(state: ArtifactState, goal: Goal): Promise<Readiness>;
}

export class ReadinessEngine implements IReadinessEngine {
  private plugins: ReadinessPlugin[] = [];

  registerPlugin(plugin: ReadinessPlugin) {
    this.plugins.push(plugin);
  }

  async evaluateReadiness(state: ArtifactState, goal: Goal): Promise<Readiness> {
    const plugin = this.plugins.find(p => p.supports(goal));
    if (plugin) {
      return plugin.evaluate(state, goal);
    }

    // Generic fallback readiness
    return {
      percentage: 50,
      isReady: false,
      missingContext: ['Additional context needed for decision']
    };
  }
}
