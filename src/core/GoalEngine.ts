import { ArtifactState, Goal, IGoalEngine } from './types';

export interface GoalPlugin {
  supports(state: ArtifactState): boolean;
  inferGoal(state: ArtifactState): Promise<Goal>;
}

export class GoalEngine implements IGoalEngine {
  private plugins: GoalPlugin[] = [];

  registerPlugin(plugin: GoalPlugin) {
    this.plugins.push(plugin);
  }

  async determineGoal(state: ArtifactState): Promise<Goal> {
    const plugin = this.plugins.find(p => p.supports(state));
    if (plugin) {
      return plugin.inferGoal(state);
    }

    // Generic fallback goal
    return {
      id: `g_${Date.now()}`,
      title: 'Review Artifact',
      description: 'Analyze and extract key information from this document.',
      category: 'Review'
    };
  }
}
