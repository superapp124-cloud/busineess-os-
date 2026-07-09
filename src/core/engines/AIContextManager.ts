/**
 * CHATR Kernel Runtime v2.0 — AIContextManager
 *
 * Layer 3 — Core Engines
 *
 * The AI should never decide context gathering itself. 
 * The runtime assembles the context package first:
 * User Request → Context Manager → Memory → Relationship → Knowledge → Workspace → Timeline → AI
 */

import { IEngine, EngineHealth, EngineStatus } from '../runtime/types';
import { KernelAPI } from '../runtime/KernelAPI';

export interface AIContextPackage {
  workingMemory: Record<string, unknown[]>;
  semanticGraph: { nodes: unknown[]; edges: unknown[] };
  activeRelationship: unknown | null;
  upcomingTimeline: unknown[];
  activeWorkspaceModules: string[];
  callSession?: unknown | null;
  permissions: string[];
}

export class AIContextManagerImpl implements IEngine {
  readonly id = 'AIContextManager';
  readonly version = '2.0.0';
  readonly kernelCompatibility = '>=2.0.0';
  readonly dependsOn = ['MemoryEngine', 'KnowledgeEngine', 'RelationshipEngine', 'TimelineEngine', 'CallEngine'];

  private _status: EngineStatus = 'stopped';
  private kernel!: KernelAPI;

  status(): EngineStatus { return this._status; }
  ready(): boolean { return this._status === 'ready'; }
  metrics(): Record<string, number> { return {}; }

  async health(): Promise<EngineHealth> {
    return { status: this._status, lastChecked: Date.now() };
  }

  async init(api: KernelAPI): Promise<void> {
    this._status = 'booting';
    this.kernel = api;
    this._status = 'ready';
  }

  async assembleContext(query: string, contactId?: string): Promise<AIContextPackage> {
    const context: AIContextPackage = {
      workingMemory: {},
      semanticGraph: { nodes: [], edges: [] },
      activeRelationship: null,
      upcomingTimeline: [],
      activeWorkspaceModules: [],
      callSession: null,
      permissions: []
    };

    try {
      context.workingMemory = this.kernel.memory.getWorkingEntities();
      
      const knowledge = this.kernel.state.get('knowledge');
      context.semanticGraph = { nodes: knowledge.nodes, edges: knowledge.edges };
      
      if (this.kernel.hasEngine('CallEngine')) {
        context.callSession = (this.kernel.getEngine<{ activeSession: unknown }>('CallEngine')).activeSession;
      }
      
      // Load current user's general permission set
      context.permissions = ['execute:search', 'read:timeline']; 

      if (contactId) {
        context.activeRelationship = await this.kernel.relationship.get(contactId);
      }
      
      context.upcomingTimeline = this.kernel.timeline.getFuture();
      
      context.activeWorkspaceModules = this.kernel.state.get('workspace').activeModules;
    } catch (err) {
      console.warn(`[AIContextManager] Partial context assembled due to error:`, err);
    }

    return context;
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  async restart(): Promise<void> {
    await this.dispose();
    await this.init(this.kernel);
  }

  async dispose(): Promise<void> {
    this._status = 'stopped';
  }
}

export const aiContextManager = new AIContextManagerImpl();
