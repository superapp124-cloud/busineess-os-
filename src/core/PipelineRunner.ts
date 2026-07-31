import { 
  Artifact, ArtifactState, Goal, Readiness, Decision, Recommendation, 
  ContextNode, HistoryEvent, TimelineEvent, Person, Workflow, WorkspaceState 
} from './types';
import { ArtifactEngine } from './ArtifactEngine';
import { GoalEngine } from './GoalEngine';
import { ReadinessEngine } from './ReadinessEngine';
import { DecisionEngine } from './DecisionEngine';
import { RecommendationEngine } from './RecommendationEngine';
import { WorkGraph } from './WorkGraph';
import { MemoryEngine } from './MemoryEngine';

export class PipelineRunner {
  private artifactEngine = new ArtifactEngine();
  private goalEngine = new GoalEngine();
  private readinessEngine = new ReadinessEngine();
  private decisionEngine = new DecisionEngine();
  private recommendationEngine = new RecommendationEngine();
  private workGraph = new WorkGraph();
  private memoryEngine = new MemoryEngine(this.workGraph);

  async processArtifact(artifact: Artifact): Promise<WorkspaceState> {
    // 1. Understand (Extract & Normalize)
    const state = await this.artifactEngine.process(artifact);

    // 2. Goal
    const goal = await this.goalEngine.determineGoal(state);

    // 3. Readiness
    const readiness = await this.readinessEngine.evaluateReadiness(state, goal);

    // 4. Decision
    const decisions = await this.decisionEngine.findDecisions(state, goal);

    // 5. Recommendation
    const recommendations = await this.recommendationEngine.generateRecommendations(state, goal);

    // 6. Memory & WorkGraph (Context)
    const history = await this.memoryEngine.findHistoricalContext(artifact);
    const relatedContext = await this.workGraph.getRelatedNodes(artifact.id);

    // Provide default empty arrays for now for the remaining UI elements
    const people: Person[] = [];
    const workflows: Workflow[] = [];

    // Map ArtifactState timeline to WorkspaceState timeline
    const timeline: TimelineEvent[] = state.timeline;

    return {
      artifact,
      goal,
      readiness,
      decisions,
      recommendations,
      relatedContext,
      history,
      timeline,
      people,
      workflows,
      viewer: 'DEFAULT_VIEWER'
    };
  }
}
