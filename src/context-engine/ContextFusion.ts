// ─────────────────────────────────────────────────────────────────────────────
// ContextFusion — merges multiple ContextSources + Domain Intelligence plugins
// into a single ContextState. This is CHATR's competitive moat.
// ─────────────────────────────────────────────────────────────────────────────
import {
  ContextSource,
  ContextState,
  IntelligencePlugin,
  EMPTY_CONTEXT,
  DomainId,
  ContextAction,
  ContextInsight,
  ContextRecommendation,
  Entity,
} from './types';

const CONFIDENCE_THRESHOLD = 0.15;

export class ContextFusion {
  private plugins: Map<DomainId, IntelligencePlugin> = new Map();

  /** Register a Domain Intelligence plugin */
  registerPlugin(plugin: IntelligencePlugin): void {
    this.plugins.set(plugin.id, plugin);
  }

  /**
   * Fuse all active ContextSources into a single ContextState.
   * Target: <300 ms.
   */
  fuse(sources: ContextSource[]): ContextState {
    if (sources.length === 0) return { ...EMPTY_CONTEXT, updatedAt: Date.now() };

    const activeDomains: Array<{ id: DomainId; confidence: number }> = [];
    const allEntities: Entity[] = [];
    const allInsights: ContextInsight[] = [];
    const allActions: ContextAction[] = [];
    const allRecommendations: ContextRecommendation[] = [];
    const summaries: string[] = [];

    // Run every registered plugin and collect contributions
    for (const plugin of this.plugins.values()) {
      const confidence = plugin.canHandle(sources);
      if (confidence < CONFIDENCE_THRESHOLD) continue;

      activeDomains.push({ id: plugin.id, confidence });

      const result = plugin.analyze(sources);
      if (result.summary) summaries.push(result.summary);
      if (result.entities) allEntities.push(...result.entities);
      if (result.insights) allInsights.push(...result.insights);
      if (result.actions) allActions.push(...result.actions);
      if (result.recommendations) allRecommendations.push(...result.recommendations);
    }

    // Sort domains by confidence (descending)
    activeDomains.sort((a, b) => b.confidence - a.confidence);

    // Deduplicate entities by label
    const uniqueEntities = allEntities.filter(
      (e, i, arr) => arr.findIndex(x => x.label === e.label) === i
    );

    // Pick the most descriptive summary
    const summary = summaries.find(s => s.length > 0) ?? 'Analyzing context...';

    return {
      summary,
      domains: activeDomains.map(d => d.id),
      entities: uniqueEntities,
      insights: allInsights,
      actions: allActions,
      recommendations: allRecommendations,
      isProcessing: false,
      updatedAt: Date.now(),
    };
  }
}
