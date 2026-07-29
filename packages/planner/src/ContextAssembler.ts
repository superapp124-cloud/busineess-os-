import { Intent, PlanningContext } from './contracts/index';

/**
 * Assembles all context required for planning from independent services.
 * The Planner never queries memory or semantic search directly.
 *
 * Inputs:  Intent, Memory, SemanticSearch, CapabilityMetadata, OrgPolicy, UserContext
 * Output:  PlanningContext (stable contract)
 */
export interface ContextAssembler {
  assemble(intent: Intent): Promise<PlanningContext>;
}
