import { ArtifactState, Goal, Recommendation, IRecommendationEngine } from './types';

export interface RecommendationPlugin {
  supports(goal: Goal): boolean;
  generateRecommendations(state: ArtifactState, goal: Goal): Promise<Recommendation[]>;
}

export class RecommendationEngine implements IRecommendationEngine {
  private plugins: RecommendationPlugin[] = [];

  registerPlugin(plugin: RecommendationPlugin) {
    this.plugins.push(plugin);
  }

  async generateRecommendations(state: ArtifactState, goal: Goal): Promise<Recommendation[]> {
    const plugin = this.plugins.find(p => p.supports(goal));
    if (plugin) {
      return plugin.generateRecommendations(state, goal);
    }

    return [
      { id: 'rec_1', title: 'Complete missing fields', impact: 'Medium Impact', estimatedTime: '5 minutes' }
    ];
  }
}
